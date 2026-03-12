/*

MyJob Recruitment System - Part of MyJob Platform

Author: Antigravity (Google DeepMind)
*/

import i18n from '../i18n';
const t = (key, options) => i18n.t(key, options);

/**

 * Transformers Layer: Centralized mapping from Backend API responses to Frontend models.

 * This ensures consistency and avoids "undefined" checks scattered across components.

 */

export const transformQuestion = (q) => {

    if (!q) return null;

    return {

        id: q.id,

        text: q.text || q.questionText || q.content || '',

        category: q.category || t('common:labels.uncategorized'),

        question_type: q.question_type || q.type || 'TEXT',

        // Preserve other fields if needed

        ...q,

        // Ensure the mapped field "text" is always present for consistent UI use

        text: q.text || q.questionText || q.content || '',

    };

};

export const transformQuestionGroup = (group) => {

    if (!group) return null;

    return {

        id: group.id,

        name: group.name || '',

        description: group.description || '',

        questions: (group.questions || []).map(transformQuestion),

        // Preserve other fields

        ...group,

    };

};

export const transformInterviewSession = (session) => {

    if (!session) return null;

    return {

        id: session.id,

        job_post_id: session.job_post || session.job_post_dict?.id || session.jobPostDict?.id || null,

        candidate_id: session.candidate || session.candidate_dict?.id || session.jobSeekerDict?.id,

        candidateName: session.candidate_name || session.candidate_dict?.fullName || session.jobSeekerDict?.fullName || '',

        candidateEmail: session.candidate_email || session.candidate_dict?.email || session.jobSeekerDict?.email || '',
        candidate_email: session.candidate_email || session.candidate_dict?.email || session.jobSeekerDict?.email || '',

        jobName: session.job_name || session.job_post_name || session.job_post_dict?.jobName || session.jobPostDict?.jobName || '',

        scheduledAt: session.scheduled_at || session.startTime || '',
        status: session.status || 'PENDING',
        interview_type: session.interview_type || session.interviewType || null,
        type: session.type || session.interview_type || session.interviewType || null,
        inviteToken: session.invite_token || session.inviteToken || null,
        notes: session.notes || '',
        questions: (session.questions || []).map(transformQuestion),

        ...session,

        candidateName: session.candidate_name || session.candidate_dict?.fullName || session.jobSeekerDict?.fullName || '',
        candidateEmail: session.candidate_email || session.candidate_dict?.email || session.jobSeekerDict?.email || '',
        candidate_email: session.candidate_email || session.candidate_dict?.email || session.jobSeekerDict?.email || '',
        jobName: session.job_name || session.job_post_name || session.job_post_dict?.jobName || session.jobPostDict?.jobName || '',
        scheduledAt: session.scheduled_at || session.startTime || '',
        inviteToken: session.invite_token || session.inviteToken || null,
    };
};

export const transformJobPost = (job) => {

    if (!job) return null;

    return {

        id: job.id,

        title: job.jobName || job.title || '',

        companyName: job.companyDict?.companyName || '',

        location: job.locationDict?.city || '',

        salaryMin: job.salaryMin,

        salaryMax: job.salaryMax,

        deadline: job.deadline,

        ...job,

        // Add alias for common use cases

        jobName: job.jobName || job.title || '',

    };

};

export const transformAppliedResume = (resume) => {

    if (!resume) return null;

    const userId = resume.userId || resume.user?.id || resume.user_id;

    return {

        id: resume.id,

        candidateId: userId, // Prefer user ID for interview/candidate logic

        userId: userId,

        candidateName: resume.fullName || resume.user?.full_name || '',

        fullName: resume.fullName || resume.user?.full_name || '',

        email: resume.email || resume.user?.email || '',

        resumeSlug: resume.resumeSlug || resume.resume?.slug || '',

        jobName: resume.jobName || '',

        status: resume.status,

        ...resume,

        candidateId: userId,

        candidateName: resume.fullName || resume.user?.full_name || '',

    };

};

