import { createFeedbackSchema } from '../index';

const t = (key: string) => key;

describe('createFeedbackSchema', () => {
  it('rejects ratings outside the 1-5 star range', async () => {
    const schema = createFeedbackSchema(t as never);

    await expect(schema.validateAt('rating', { rating: 0 })).rejects.toThrow(
      'feedback.ratingRequired',
    );
    await expect(schema.validateAt('rating', { rating: 6 })).rejects.toThrow(
      'feedback.ratingInvalid',
    );
  });
});
