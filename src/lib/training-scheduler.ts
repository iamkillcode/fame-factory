import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore';
import { gameTimeManager } from './game-time-manager';
import { TrainingActivity } from '@/config/training-activities';

export interface ScheduledTraining {
  id: string;
  artistId: string;
  activityId: string;
  duration: 'short' | 'medium' | 'long';
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  cost: number;
  energyCost: number;
  expectedSkillGain: number;
}

class TrainingScheduler {
  private static instance: TrainingScheduler;
  private scheduledTrainings: Map<string, ScheduledTraining> = new Map();

  private constructor() {}

  public static getInstance(): TrainingScheduler {
    if (!TrainingScheduler.instance) {
      TrainingScheduler.instance = new TrainingScheduler();
    }
    return TrainingScheduler.instance;
  }

  public async scheduleTraining(
    artistId: string,
    activity: TrainingActivity,
    duration: 'short' | 'medium' | 'long',
    startTime: Date
  ): Promise<ScheduledTraining> {
    // Calculate end time based on duration
    const durationHours = activity.durationOptions[duration].hours;
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    // Check for scheduling conflicts
    const conflicts = await this.getConflictingSchedules(artistId, startTime, endTime);
    if (conflicts.length > 0) {
      throw new Error('Training schedule conflicts with existing training');
    }

    // Create the scheduled training
    const scheduledTraining: Omit<ScheduledTraining, 'id'> = {
      artistId,
      activityId: activity.id,
      duration,
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      status: 'scheduled',
      cost: activity.moneyCost,
      energyCost: activity.energyCost * activity.durationOptions[duration].multiplier,
      expectedSkillGain: activity.baseSkillGain * activity.durationOptions[duration].multiplier
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'scheduledTrainings'), scheduledTraining);
    const newScheduledTraining = { ...scheduledTraining, id: docRef.id } as ScheduledTraining;
    
    this.scheduledTrainings.set(docRef.id, newScheduledTraining);
    return newScheduledTraining;
  }

  public async cancelTraining(trainingId: string): Promise<void> {
    const training = this.scheduledTrainings.get(trainingId);
    if (!training) {
      throw new Error('Training not found');
    }

    if (training.status === 'in-progress') {
      throw new Error('Cannot cancel training in progress');
    }

    await updateDoc(
      // Use doc() to get a DocumentReference for the specific training
      doc(db, 'scheduledTrainings', trainingId),
      {
        status: 'cancelled'
      }
    );

    this.scheduledTrainings.delete(trainingId);
  }

  private async getConflictingSchedules(
    artistId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ScheduledTraining[]> {
    const schedulesRef = collection(db, 'scheduledTrainings');
    const q = query(
      schedulesRef,
      where('artistId', '==', artistId),
      where('status', 'in', ['scheduled', 'in-progress'])
    );

    const querySnapshot = await getDocs(q);
    const conflicts: ScheduledTraining[] = [];

    querySnapshot.forEach((doc) => {
      const training = doc.data() as ScheduledTraining;
      const trainingStart = new Date(training.scheduledStartTime);
      const trainingEnd = new Date(training.scheduledEndTime);

      if (
        (startTime >= trainingStart && startTime < trainingEnd) ||
        (endTime > trainingStart && endTime <= trainingEnd) ||
        (startTime <= trainingStart && endTime >= trainingEnd)
      ) {
        conflicts.push({ ...training, id: doc.id });
      }
    });

    return conflicts;
  }

  public async getArtistSchedule(artistId: string): Promise<ScheduledTraining[]> {
    const schedulesRef = collection(db, 'scheduledTrainings');
    const q = query(
      schedulesRef,
      where('artistId', '==', artistId),
      where('status', 'in', ['scheduled', 'in-progress'])
    );

    const querySnapshot = await getDocs(q);
    const schedule: ScheduledTraining[] = [];

    querySnapshot.forEach((doc) => {
      schedule.push({ ...doc.data(), id: doc.id } as ScheduledTraining);
    });

    return schedule;
  }
}

export const trainingScheduler = TrainingScheduler.getInstance();
