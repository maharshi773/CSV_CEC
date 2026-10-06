import { createFileRoute } from "@tanstack/react-router";
import { WorkingPaper } from "@/components/working-paper";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <WorkingPaper />;
}
