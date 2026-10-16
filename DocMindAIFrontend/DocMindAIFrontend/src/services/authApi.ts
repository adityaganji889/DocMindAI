import api from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, UserDto, DefaultResponse, ChangePasswordRequest } from '../types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  register: async (payload: RegisterRequest): Promise<UserDto> => {
    const { data } = await api.post<UserDto>('/auth/register', payload);
    return data;
  },

  //Forgot, Reset Password Functionalities changes starts
  forgotPassword: async (email: string): Promise<DefaultResponse> => {
    const { data } = await api.post<DefaultResponse>(
      `/auth/forgotPassword/${encodeURIComponent(email)}`
    );
    return data;
  },

  resetPassword: async (
    otp: Number,
    email: string,
    payload: ChangePasswordRequest
  ): Promise<DefaultResponse> => {
    const { data } = await api.post<DefaultResponse>(
      `/auth/resetPassword/${otp}/${encodeURIComponent(email)}`,
      payload
    );
    return data;
  },
  //Forgot, Reset Password Functionalities changes ends

};
