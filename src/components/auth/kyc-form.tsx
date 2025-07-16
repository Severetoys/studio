"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const kycFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  document: z.any()
    .refine((files) => files?.length == 1, "ID document is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png", "application/pdf"].includes(files?.[0]?.type),
      "Only .jpg, .png, and .pdf formats are supported."
    ),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

const defaultValues: Partial<KycFormValues> = {
  fullName: "",
  address: "",
};

interface KycFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function KycForm({ isOpen, onOpenChange }: KycFormProps) {
  const { toast } = useToast();
  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const documentRef = form.register("document");

  function onSubmit(data: KycFormValues) {
    toast({
      title: "KYC Submitted!",
      description: "Your information has been submitted for verification.",
      className: "bg-accent text-accent-foreground border-accent",
    });
    console.log(data);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Profile</DialogTitle>
          <DialogDescription>
            For security purposes, please provide the following information for verification.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residential Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main Street, Anytown, USA 12345"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Document</FormLabel>
                   <FormControl>
                    <div className="relative flex items-center justify-center w-full">
                       <Label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            {field.value?.[0]?.name ? (
                               <p className="font-semibold text-primary">{field.value[0].name}</p>
                            ) : (
                              <>
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG or PDF (MAX. 5MB)</p>
                              </>
                            )}
                          </div>
                          <Input id="document-upload" type="file" className="hidden" {...documentRef} />
                       </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Submit for Verification</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
