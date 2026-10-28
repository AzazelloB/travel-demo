import { Link } from 'react-router-dom';
import { buttonStyles } from '../ui/Button';
import { Empty } from '../ui/Empty';

export function NotFound() {
  return (
    <Empty title="This place isn’t on the map.">
      <Link className={buttonStyles()} to="/destinations">
        Explore destinations
      </Link>
    </Empty>
  );
}
