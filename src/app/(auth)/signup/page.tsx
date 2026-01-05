import Link from "next/link";
import Image from "next/image";

import { SignupForm } from "@/components/forms/signup-form";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SignupPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <div className="flex size-6 items-center justify-center rounded-md text-primary-foreground">
            <Image
              alt="Inflow Logo"
              height={50}
              priority
              src={"/assets/inflow.svg"}
              width={50}
            />
          </div>
          Inflow
        </Link>
        <SignupForm />
      </div>
    </div>
  );
}
