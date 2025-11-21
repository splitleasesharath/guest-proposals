import { createRoot } from 'react-dom/client';
import ProposalsIsland from './islands/pages/ProposalsIsland.jsx';

// Mount Proposals
const proposalsRoot = createRoot(document.getElementById('proposals-island'));
proposalsRoot.render(<ProposalsIsland />);
