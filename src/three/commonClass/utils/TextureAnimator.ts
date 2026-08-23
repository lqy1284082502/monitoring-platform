import * as THREE from 'three';

export default class TextureAnimator {
    private readonly tilesHoriz: number;
    private readonly tilesVert: number;
    private readonly numTiles: number;
    private readonly tileDisplayDuration: number;
    private currentDisplayTime: number;
    private currentTile: number;
    private readonly texture: THREE.Texture;

    constructor(texture: THREE.Texture, tilesHoriz: number, tilesVert: number, numTiles: number, tileDispDuration: number) {
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.numTiles = numTiles;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / this.tilesHoriz, 1 / this.tilesVert);
        this.tileDisplayDuration = tileDispDuration;
        this.currentDisplayTime = 0;
        this.currentTile = 0;
        this.texture = texture;
    }
    update(milliSec: number) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile === this.numTiles) {
                this.currentTile = 0;
            }
            const currentColumn = this.currentTile % this.tilesHoriz;
            this.texture.offset.x = currentColumn / this.tilesHoriz;
            const currentRow = Math.floor(this.currentTile / this.tilesHoriz);
            this.texture.offset.y = currentRow / this.tilesVert;
        }
    }
}
