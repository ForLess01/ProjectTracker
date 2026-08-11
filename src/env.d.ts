/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
    } | null;
    session: {
      id: string;
      expiresAt: Date;
    } | null;
  }
}
