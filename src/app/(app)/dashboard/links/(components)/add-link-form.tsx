"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Loader2, ExternalLink } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortCode: z
    .string()
    .min(1, "Short code is required")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Only letters, numbers, hyphens and underscores allowed"
    ),
  destinationUrl: z.string().url("Must be a valid URL"),
});

export default function AddLinkForm() {
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shortCode: "",
      destinationUrl: "",
    },
  });

  const onSubmit = async () => {
    setLoading(true);

    try {
      const linkId = crypto.randomUUID();
      const result = await axios.post("/api/links", {
        linkId: linkId,
        name: name,
        shortCode: shortCode,
        destinationUrl: destinationUrl,
      });

      if (result.status === 201) {
        toast.success("Link created successfully!");
        form.reset();
        setName("");
        setShortCode("");
        setDestinationUrl("");
        router.refresh();
      } else if (result.data?.message) {
        toast.error(result.data.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred");
      }
      console.error("Error creating link:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="grid items-center mb-4 px-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-2">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        setName(value);
                      }}
                      placeholder="My Campaign Link"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortCode"
            render={({ field }) => (
              <FormItem>
                <div className="grid items-center mb-4 px-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-2">
                    Short Code
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          setShortCode(value);
                        }}
                        placeholder="my-link"
                      />
                      <InputGroupAddon>
                        <LinkIcon className="h-4 w-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destinationUrl"
            render={({ field }) => (
              <FormItem>
                <div className="grid items-center mb-4 px-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-2">
                    Destination URL
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        type="url"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          setDestinationUrl(value);
                        }}
                        placeholder="https://example.com/page"
                      />
                      <InputGroupAddon>
                        <ExternalLink className="h-4 w-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="px-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save Link"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
