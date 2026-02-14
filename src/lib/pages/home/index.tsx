import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <Button variant="outline" size="lg">
        Welcome to Parsley!
      </Button>
      <p className="max-w-sm text-muted-foreground">
        This is a starter template for your Vite + React + TypeScript project.
        Feel free to explore and customize it to your needs.
      </p>
    </div>
  );
};

export default Home;
