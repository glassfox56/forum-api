import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    };

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn().mockResolvedValue(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
      }),
    );

    const useCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });
    const addedThread = await useCase.execute(useCasePayload);

    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread(useCasePayload),
    );
  });
});
