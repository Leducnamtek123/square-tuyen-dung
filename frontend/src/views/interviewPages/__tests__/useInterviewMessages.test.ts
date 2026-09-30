import { ParticipantKind } from 'livekit-client';
import { mapTranscriptions } from '../useInterviewMessages';

describe('mapTranscriptions', () => {
  it('maps local user to userTranscript, agent to agentTranscript, and non-agent remote to userTranscript', () => {
    const participants = [
      {
        kind: ParticipantKind.STANDARD,
        identity: 'candidate-1',
        name: 'Candidate',
        attributes: { role: 'candidate' },
      },
      {
        kind: ParticipantKind.AGENT,
        identity: 'agent-1',
        name: 'AI',
        attributes: { role: 'agent' },
      },
      {
        kind: ParticipantKind.STANDARD,
        identity: 'employer-1',
        name: 'Employer',
        attributes: { role: 'employer' },
      },
    ] as any;

    const transcriptions = [
      {
        text: 'toi la ung vien',
        participantInfo: { identity: 'candidate-1' },
        streamInfo: { id: 's1', timestamp: 1 },
      },
      {
        text: 'toi la ai',
        participantInfo: { identity: 'agent-1' },
        streamInfo: { id: 's2', timestamp: 2 },
      },
      {
        text: 'toi la nha tuyen dung',
        participantInfo: { identity: 'employer-1' },
        streamInfo: { id: 's3', timestamp: 3 },
      },
    ] as any;

    const messages = mapTranscriptions(transcriptions, 'candidate-1', participants as any);
    expect(messages).toHaveLength(3);
    expect(messages[0]?.type).toBe('userTranscript');
    expect(messages[1]?.type).toBe('agentTranscript');
    expect(messages[2]?.type).toBe('userTranscript');
    expect(messages[2]?.from?.identity).toBe('employer-1');
  });

  it('filters out STT hallucinations like YouTube outro phrases', () => {
    const participants = [
      {
        kind: ParticipantKind.STANDARD,
        identity: 'candidate-1',
        name: 'Candidate',
        attributes: { role: 'candidate' },
      },
    ] as any;

    const transcriptions = [
      {
        text: 'Hãy subscribe cho kênh Ghiền Mì Gõ Để không bỏ lỡ những video hấp dẫn',
        participantInfo: { identity: 'candidate-1' },
        streamInfo: { id: 's1', timestamp: 1 },
      },
      {
        text: 'Chào bạn, tôi là ứng viên',
        participantInfo: { identity: 'candidate-1' },
        streamInfo: { id: 's2', timestamp: 2 },
      },
    ] as any;

    const messages = mapTranscriptions(transcriptions, 'candidate-1', participants as any);

    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toBe('Chào bạn, tôi là ứng viên');
  });
});

describe('isAgentMessage & normalizeMessageText', () => {
  const { isAgentMessage, normalizeMessageText } = require('../useInterviewMessages');

  it('normalizes punctuation and case correctly', () => {
    expect(normalizeMessageText('  Tuyệt vời, chúng ta cùng bắt đầu nhé!  ')).toBe('tuyệt vời chúng ta cùng bắt đầu nhé');
    expect(normalizeMessageText('Chào bạn: bạn nghe rõ không?')).toBe('chào bạn bạn nghe rõ không');
    expect(normalizeMessageText('')).toBe('');
    expect(normalizeMessageText(null)).toBe('');
  });

  it('correctly identifies agent messages across diverse identities and participant kinds', () => {
    expect(isAgentMessage({ type: 'agentTranscript', id: '1', message: 'Hi', timestamp: 100 })).toBe(true);
    expect(
      isAgentMessage({
        type: 'chat',
        id: '2',
        message: 'Hi',
        timestamp: 100,
        from: { identity: 'agent-interview-1' },
      }),
    ).toBe(true);
    expect(
      isAgentMessage({
        type: 'chat',
        id: '3',
        message: 'Hi',
        timestamp: 100,
        from: { kind: ParticipantKind.AGENT, identity: 'custom-worker' },
      }),
    ).toBe(true);
    expect(
      isAgentMessage({
        type: 'chat',
        id: '4',
        message: 'Hi',
        timestamp: 100,
        from: { identity: 'candidate-1', attributes: { role: 'candidate' } },
      }),
    ).toBe(false);
  });
});

describe('processInterviewTimeline & Clock Skew Protection', () => {
  const {
    processInterviewTimeline,
    createInitialProcessTimelineState,
    normalizeMessageTimestamp,
  } = require('../useInterviewMessages');

  it('normalizes seconds and millisecond timestamps properly', () => {
    expect(normalizeMessageTimestamp(1727576500)).toBe(1727576500000);
    expect(normalizeMessageTimestamp(1727576500000)).toBe(1727576500000);
    const fallback = 999999;
    expect(normalizeMessageTimestamp(undefined, fallback)).toBe(fallback);
    expect(normalizeMessageTimestamp(null, fallback)).toBe(fallback);
    expect(normalizeMessageTimestamp(0, fallback)).toBe(fallback);
  });

  it('guarantees AI response stays AFTER candidate message even if server clock has 3 minutes drift', () => {
    const state = createInitialProcessTimelineState();

    // 1. Initial AI question
    const q1 = {
      id: 'q1',
      type: 'chatMessage',
      message: 'Chào bạn, chúng ta bắt đầu phỏng vấn nhé',
      timestamp: 1790648300000, // 09:18:20
      from: { identity: 'agent-1' },
    };

    // 2. Candidate message sent with local client clock at 09:22:47
    const candMsg = {
      id: 'cand1',
      type: 'chatMessage',
      message: 'là sao',
      timestamp: 1790648567000, // 09:22:47
      from: { identity: 'candidate-1070', isLocal: true },
    };

    // First render with q1 and candidate message
    const step1 = processInterviewTimeline([q1, candMsg], state);
    expect(step1).toHaveLength(2);
    expect(step1[0].message).toBe('Chào bạn, chúng ta bắt đầu phỏng vấn nhé');
    expect(step1[1].message).toBe('là sao');

    // 3. AI response arrives with server clock drift (e.g. server was at 09:19:48, 3 minutes behind client!)
    const aiReplyWithClockDrift = {
      id: 'ai-reply-1',
      type: 'chatMessage',
      message: 'Bạn nói thêm một chút được không? Mình muốn hiểu ví dụ thực tế.',
      timestamp: 1790648388000, // 09:19:48 (server clock was behind client by 3 mins!)
      from: { identity: 'agent-1' },
      attributes: { role: 'agent' },
    };

    // Subsequent render when AI response arrives
    const step2 = processInterviewTimeline([q1, candMsg, aiReplyWithClockDrift], state);
    expect(step2).toHaveLength(3);
    // CRITICAL BUG FIX VERIFICATION:
    // AI response must NEVER jump to index 0 or before candidate message!
    expect(step2[0].id).toBe('q1');
    expect(step2[1].id).toBe('cand1');
    expect(step2[2].id).toBe('ai-reply-1');
    expect(step2[2].timestamp).toBeGreaterThanOrEqual(step2[1].timestamp);
  });

  it('deduplicates AI turn when both avatar_event and lk.chat emit within 8 seconds', () => {
    const state = createInitialProcessTimelineState();
    const text = 'Quy trình triển khai mô hình BIM Revit và quản lý phối hợp?';

    const avatarMsg = {
      id: 'avatar-1',
      type: 'agentTranscript',
      message: text,
      timestamp: 1790648500000,
      from: { identity: 'agent-1' },
    };

    const lkChatMsg = {
      id: 'lk-chat-1',
      type: 'chatMessage',
      message: text,
      timestamp: 1790648500050, // 50ms later
      from: { identity: 'agent-1' },
    };

    const result = processInterviewTimeline([avatarMsg, lkChatMsg], state);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe(text);
  });

  it('allows the AI to repeat the same phrase later in the interview (> 8s apart)', () => {
    const state = createInitialProcessTimelineState();
    const commonFollowup = 'Bạn nói thêm một chút được không?';

    const msg1 = {
      id: 'turn-1',
      type: 'chatMessage',
      message: commonFollowup,
      timestamp: 1790648500000,
      from: { identity: 'agent-1' },
    };

    const step1 = processInterviewTimeline([msg1], state);
    expect(step1).toHaveLength(1);

    // 60 seconds later, AI asks the same common follow-up
    const msg2 = {
      id: 'turn-2',
      type: 'chatMessage',
      message: commonFollowup,
      timestamp: 1790648560000,
      from: { identity: 'agent-1' },
    };

    const step2 = processInterviewTimeline([msg1, msg2], state);
    expect(step2).toHaveLength(2);
    expect(step2[0].id).toBe('turn-1');
    expect(step2[1].id).toBe('turn-2');
  });

  it('deduplicates user STT chunks within 3 seconds', () => {
    const state = createInitialProcessTimelineState();

    const chunk1 = {
      id: 'stt-1',
      type: 'userTranscript',
      message: 'tôi là kỹ sư xây dựng',
      timestamp: 1790648500000,
      from: { identity: 'candidate-1' },
    };

    const chunk2 = {
      id: 'stt-2',
      type: 'userTranscript',
      message: 'tôi là kỹ sư xây dựng',
      timestamp: 1790648501500, // 1.5s later
      from: { identity: 'candidate-1' },
    };

    const result = processInterviewTimeline([chunk1, chunk2], state);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('stt-1');
  });
});


