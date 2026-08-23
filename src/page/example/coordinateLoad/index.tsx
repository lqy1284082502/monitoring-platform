import { GeoJsonLoad } from '@/three';
import { ThreeDemo } from '@/components/ThreeDemo';

function CoordinateLoad() {
    return <ThreeDemo Scene={GeoJsonLoad} stats />;
}

export default CoordinateLoad;
