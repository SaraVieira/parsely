import { SplitPane } from "@/lib/components/split-pane";
import { EditorPane } from "@/lib/components/editor-pane";
import { OutputPane } from "@/lib/components/output-pane";

const Home = () => {
  return (
    <SplitPane
      left={<EditorPane />}
      right={<OutputPane />}
    />
  );
};

export default Home;
