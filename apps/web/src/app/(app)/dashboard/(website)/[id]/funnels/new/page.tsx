"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { useWebsite } from "@/hooks/use-website";
import { useFunnels } from "@/hooks/use-funnels";
import { Button } from "@inflow/ui";
import { Input } from "@inflow/ui";
import { Label } from "@inflow/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@inflow/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@inflow/ui";
import { toast } from "sonner";

type FunnelStep = {
  type: "pageView" | "event";
  value: string;
  order: number;
};

export default function NewFunnelPage() {
  const params = useParams();
  const websiteId = params.id as string;
  const router = useRouter();

  const { website, isLoading: websiteLoading } = useWebsite(websiteId);
  const { createFunnel } = useFunnels(websiteId);

  const [name, setName] = useState("");
  const [steps, setSteps] = useState<FunnelStep[]>([
    { type: "pageView", value: "/", order: 1 },
    { type: "event", value: "signup", order: 2 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (websiteLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="lg:mt-8 mt-10 w-full text-center py-12">
        <p className="text-muted-foreground">Website not found</p>
        <Link href={`/dashboard/${websiteId}/funnels`}>
          <Button variant="link" className="mt-4">
            Back to Funnels
          </Button>
        </Link>
      </div>
    );
  }

  const addStep = () => {
    setSteps([...steps, { type: "pageView", value: "", order: steps.length + 1 }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof FunnelStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Funnel name is required");
      return;
    }

    if (steps.some(s => !s.value.trim())) {
      toast.error("All steps must have a value URL/Event Name");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFunnel({ name, steps });
      toast.success("Funnel created successfully");
      router.push(`/dashboard/${websiteId}/funnels`);
    } catch (error) {
      toast.error("Failed to create funnel");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:mt-8 mt-10 space-y-6 pb-24">
      <div className="mb-8 border-b pb-6">
        <Link
          href={`/dashboard/${websiteId}/funnels`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Funnels</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create New Funnel</h1>
        <p className="text-muted-foreground">
          Define the steps you want to track for conversion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Funnel Details</CardTitle>
            <CardDescription>Give your funnel a descriptive name.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Signup Flow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funnel Steps</CardTitle>
            <CardDescription>
              Add the pages or events that make up this funnel in order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start relative">
                <div className="mt-2 text-sm font-medium text-muted-foreground w-8 text-center shrink-0">
                  {index + 1}.
                </div>
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="col-span-1">
                    <Select
                      value={step.type}
                      onValueChange={(value: "pageView" | "event") => updateStep(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pageView">Page View</SelectItem>
                        <SelectItem value="event">Custom Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder={step.type === "pageView" ? "e.g. /pricing" : "e.g. signup_clicked"}
                      value={step.value}
                      onChange={(e) => updateStep(index, "value", e.target.value)}
                      required
                    />
                  </div>
                </div>
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-[-16px] w-[2px] bg-border" />
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 ml-12"
              onClick={addStep}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/dashboard/${websiteId}/funnels`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Funnel
          </Button>
        </div>
      </form>
    </div>
  );
}
