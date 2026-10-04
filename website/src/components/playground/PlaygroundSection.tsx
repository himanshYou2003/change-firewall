import PlaygroundLoader from './PlaygroundLoader';

export default function PlaygroundSection() {
  return <div className="playground-section" aria-label="Interactive Change Firewall IDE">
    <div className="playground-section-heading"><span>REAL COMMANDS · REAL GIT STATE</span><h2>Edit the sample. Run the actual CLI. See what changes.</h2><p>The lightweight preview loads immediately. Start a live disposable runtime when you are ready; if it is unavailable, the terminal says so and never invents results.</p></div>
    <PlaygroundLoader />
  </div>;
}
