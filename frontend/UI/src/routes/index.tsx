import { createFileRoute } from "@tanstack/react-router";
import { TransitOpsApp } from "@/components/transitops/TransitOpsApp";

export const Route = createFileRoute("/")({
  component: TransitOpsApp,
});
