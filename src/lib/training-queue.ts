import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { gameTimeManager } from './game-time-manager';

export interface QueuedTraining {
  id: string;
  artistId: string;
  activityId: string;
  duration: 'short' | 'medium' | 'long';
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  status: 'queued' | 'in-progress' | 'completed' | 'cancelled';
  queuePosition: number;
  prerequisites?: string[]; // IDs of training sessions that must be completed first
  dependents?: string[]; // IDs of training sessions that depend on this one
}

class TrainingQueue {
  private static instance: TrainingQueue;
  
  private constructor() {}

  public static getInstance(): TrainingQueue {
    if (!TrainingQueue.instance) {
      TrainingQueue.instance = new TrainingQueue();
    }
    return TrainingQueue.instance;
  }

  public async addToQueue(
    artistId: string,
    trainingData: Omit<QueuedTraining, 'id' | 'queuePosition' | 'status'>
  ): Promise<QueuedTraining> {
    // Get current queue position
    const currentQueue = await this.getArtistQueue(artistId);
    const queuePosition = currentQueue.length;

    const queuedTraining: Omit<QueuedTraining, 'id'> = {
      ...trainingData,
      artistId,
      status: 'queued',
      queuePosition,
    };

    const docRef = doc(collection(db, 'trainingQueue'));
    await setDoc(docRef, queuedTraining);

    return {
      ...queuedTraining,
      id: docRef.id,
    };
  }

  public async getArtistQueue(artistId: string): Promise<QueuedTraining[]> {
    const queueRef = collection(db, 'trainingQueue');
    const q = query(
      queueRef,
      where('artistId', '==', artistId),
      where('status', 'in', ['queued', 'in-progress']),
      orderBy('queuePosition')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as QueuedTraining[];
  }

  public async removeFromQueue(trainingId: string): Promise<void> {
    const trainingRef = doc(db, 'trainingQueue', trainingId);
    await deleteDoc(trainingRef);
  }

  public async reorderQueue(
    artistId: string,
    orderedTrainingIds: string[]
  ): Promise<void> {
    const batch = writeBatch(db);
    
    orderedTrainingIds.forEach((trainingId, index) => {
      const ref = doc(db, 'trainingQueue', trainingId);
      batch.update(ref, { queuePosition: index });
    });

    await batch.commit();
  }

  public async addDependency(
    trainingId: string,
    dependsOnId: string
  ): Promise<void> {
    const trainingRef = doc(db, 'trainingQueue', trainingId);
    const dependsOnRef = doc(db, 'trainingQueue', dependsOnId);

    await updateDoc(trainingRef, {
      prerequisites: [dependsOnId],
    });

    await updateDoc(dependsOnRef, {
      dependents: [trainingId],
    });
  }

  public async checkQueueProgress(artistId: string): Promise<void> {
    const queue = await this.getArtistQueue(artistId);
    const currentTime = gameTimeManager.getCurrentDate();

    for (const training of queue) {
      // Skip if not ready to start
      if (training.status !== 'queued') continue;
      if (new Date(training.scheduledStartTime) > currentTime) continue;

      // Check prerequisites
      if (training.prerequisites?.length) {
        const prereqs = await Promise.all(
          training.prerequisites.map(id => 
            getDoc(doc(db, 'trainingQueue', id))
          )
        );
        
        if (!prereqs.every(doc => doc.data()?.status === 'completed')) {
          continue;
        }
      }

      // Start training
      await updateDoc(doc(db, 'trainingQueue', training.id), {
        status: 'in-progress',
      });
    }
  }
}

export const trainingQueue = TrainingQueue.getInstance();
