import { Document, Types } from 'mongoose';

export interface IRegistration {
  teamName: string;
  leader: Types.ObjectId;
  memberData: Array<{
    name: string;
    email: string;
  }>;
  memberEmails: string[];
  registeredAt: Date;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  capacity: number;
  registrations: IRegistration[];
  isTeamEvent: boolean;
  teamSize: number;
  registrationDeadline: Date;
  organizer: Types.ObjectId;
  status: 'upcoming' | 'ongoing' | 'completed';
}
