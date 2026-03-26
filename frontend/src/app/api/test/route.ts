import { NextResponse } from 'next/server';
import { IMAGES, AUTH_CONFIG } from '@/configs/constants';

export async function GET() {
  return NextResponse.json({ IMAGES, AUTH_CONFIG });
}
