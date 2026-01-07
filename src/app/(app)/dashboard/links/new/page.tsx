import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddLinkForm from "../(components)/add-link-form";

export default function AddLink() {
  return (
    <div className="lg:mt-8 mt-20 w-full">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <h1 className="font-bold lg:text-4xl text-xl tracking-tight">
          Add link
        </h1>
        <div className="">
          <Link href="/dashboard/links">
            <Button
              size="default"
              variant="outline"
              className="rounded-lg px-4 text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-nowrap">Links</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm border-dashed">
        <div className="p-6">
          <div className="w-full">
            <AddLinkForm />
          </div>
        </div>
      </div>
    </div>
  );
}
