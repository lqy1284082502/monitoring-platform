import { HDRLoad } from '@/three';
import { ThreeDemo } from '@/components/ThreeDemo';

function CameraManagement() {
    return <ThreeDemo Scene={HDRLoad} stats />;
}

export default CameraManagement;
