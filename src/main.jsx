import { createRoot } from 'react-dom/client';
import Header from './islands/shared/Header.jsx';
import Footer from './islands/shared/Footer.jsx';
import ProposalsIsland from './islands/pages/ProposalsIsland.jsx';

// Mount Header
const headerRoot = createRoot(document.getElementById('header-island'));
headerRoot.render(<Header autoShowLogin={false} />);

// Mount Proposals
const proposalsRoot = createRoot(document.getElementById('proposals-island'));
proposalsRoot.render(<ProposalsIsland />);

// Mount Footer
const footerRoot = createRoot(document.getElementById('footer-island'));
footerRoot.render(<Footer />);
