import { UserModel } from '../models/user.model';

export async function emailExists(email: string) {
  const count = await UserModel.countDocuments({ email });
  return count > 0;
}

export async function createUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  profile_pic_url: string;
  attendance_pic_url: string;
  registration_mode: 'upload' | 'live';
}) {
  return UserModel.create(data);
}
