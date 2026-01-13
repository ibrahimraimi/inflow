"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import * as z from "zod";
import axios from "axios";
import { useSWRConfig } from "swr";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InstallScriptDialog from "./install-script-dialog";

const formSchema = z.object({
  websiteName: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

export default function AddWebsiteForm() {
  const [websiteName, setWebsiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableLocalhostTracking, setEnableLocalhostTracking] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [websiteData, setWebsiteData] = useState({ id: "", domain: "" });

  const { mutate } = useSWRConfig();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteName: "",
      domain: "",
      timezone: "",
    },
  });

  const onSubmit = async () => {
    setLoading(true);

    try {
      const websiteId = crypto.randomUUID();
      const result = await axios.post("/api/website", {
        websiteId: websiteId,
        websiteName: websiteName,
        domain: domain,
        timeZone: timeZone,
        enableLocalhostTracking: enableLocalhostTracking,
      });

      if (result.status === 201) {
        toast.success("Website added successfully!");
        mutate(
          (key) => Array.isArray(key) && key[0].startsWith("/api/website")
        );
      }

      if (result.data && result.data.length > 0) {
        setWebsiteData({
          id: result.data[0].websiteId,
          domain: result.data[0].domain,
        });
        setShowInstallDialog(true);
      } else if (result.data?.message) {
        toast.error(result.data.message || "An error occurred");
      } else {
        toast.error("An error occurred");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error adding website:", error);
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
            name="websiteName"
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
                        setWebsiteName(value);
                      }}
                      placeholder="My Website"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <div className="grid items-center mb-4 px-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-2">
                    Domain
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        type="url"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          setDomain(value);
                        }}
                        placeholder="yourwebsite.com"
                      />
                      <InputGroupAddon>
                        <Globe />
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
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <div className="grid items-center mb-4 px-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
                    Timezone
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setTimeZone(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>North America</SelectLabel>
                        <SelectItem value="est">
                          Eastern Standard Time (EST)
                        </SelectItem>
                        <SelectItem value="cst">
                          Central Standard Time (CST)
                        </SelectItem>
                        <SelectItem value="mst">
                          Mountain Standard Time (MST)
                        </SelectItem>
                        <SelectItem value="pst">
                          Pacific Standard Time (PST)
                        </SelectItem>
                        <SelectItem value="akst">
                          Alaska Standard Time (AKST)
                        </SelectItem>
                        <SelectItem value="hst">
                          Hawaii Standard Time (HST)
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Europe & Africa</SelectLabel>
                        <SelectItem value="gmt">
                          Greenwich Mean Time (GMT)
                        </SelectItem>
                        <SelectItem value="cet">
                          Central European Time (CET)
                        </SelectItem>
                        <SelectItem value="eet">
                          Eastern European Time (EET)
                        </SelectItem>
                        <SelectItem value="west">
                          Western European Summer Time (WEST)
                        </SelectItem>
                        <SelectItem value="cat">
                          Central Africa Time (CAT)
                        </SelectItem>
                        <SelectItem value="eat">
                          East Africa Time (EAT)
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Asia</SelectLabel>
                        <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
                        <SelectItem value="ist">
                          India Standard Time (IST)
                        </SelectItem>
                        <SelectItem value="cst_china">
                          China Standard Time (CST)
                        </SelectItem>
                        <SelectItem value="jst">
                          Japan Standard Time (JST)
                        </SelectItem>
                        <SelectItem value="kst">
                          Korea Standard Time (KST)
                        </SelectItem>
                        <SelectItem value="ist_indonesia">
                          Indonesia Central Standard Time (WITA)
                        </SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Australia & Pacific</SelectLabel>
                        <SelectItem value="awst">
                          Australian Western Standard Time (AWST)
                        </SelectItem>
                        <SelectItem value="acst">
                          Australian Central Standard Time (ACST)
                        </SelectItem>
                        <SelectItem value="aest">
                          Australian Eastern Standard Time (AEST)
                        </SelectItem>
                        <SelectItem value="nzst">
                          New Zealand Standard Time (NZST)
                        </SelectItem>
                        <SelectItem value="fjt">Fiji Time (FJT)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>South America</SelectLabel>
                        <SelectItem value="art">
                          Argentina Time (ART)
                        </SelectItem>
                        <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
                        <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
                        <SelectItem value="clt">
                          Chile Standard Time (CLT)
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="mb-4 px-2 flex gap-2 items-center">
            <Checkbox
              onCheckedChange={(value: boolean) =>
                setEnableLocalhostTracking(value)
              }
            />
            <span>Enable localhost tracking in development.</span>
          </div>

          <div className="px-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Add Website"
              )}
            </Button>
          </div>
        </form>
      </Form>
      <InstallScriptDialog
        open={showInstallDialog}
        onOpenChange={setShowInstallDialog}
        websiteId={websiteData.id}
        domain={websiteData.domain}
      />
    </div>
  );
}
