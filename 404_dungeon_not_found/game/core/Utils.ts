export function createTileArray(layers: Phaser.Tilemaps.TilemapLayer[]): number[][] {
  const array: number[][] = [];
  const matchTable = {
    floor: 1,
    void: 0,
    pillardown: 2,
    pillarup: 3,
    wall: 4,
  };

  for (const layer of layers) {
    if (!layer) continue;

    const name = layer.layer.name as keyof typeof matchTable;
    if (!(name in matchTable)) continue;

    const layerData: number[] = [];
    const tilemap = layer.tilemap;

    for (let y = 0; y < tilemap.height; y++) {
      for (let x = 0; x < tilemap.width; x++) {
        const tile = layer.getTileAt(x, y); // ✅ layer 자체에 getTileAt 사용
        if (tile && tile.index !== -1) {
          layerData.push(matchTable[name]);
        } else {
          layerData.push(0); // 없는 곳도 채워야 2차원 배열 유지
        }
      }
    }
    array.push(layerData);
  }

  return array;
}

export function createEntityArray(entitys : any, w : number, h : number): number[][] {
  const array: number[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => 0));

  for (const e in entitys) {
    const ent = entitys[e];
    if (ent.disabled) continue;

    const pos = ent.pos;

    let val = -10;
    
    if (e.startsWith("box")) val = ent.obj.isInfinit ? -2 : -8;
    else if (e.startsWith("skeleton")) val = -3;
    else if (e.startsWith("bridge")) val = -4;
    else if (e === "door") val = ent.obj.isOpend ? -5 : 4;
    else if (e === "key") val = -6;
    else if (e === "arrow") val = -7;
    else if (e.startsWith("slime")) val = -1;
    array[pos.row][pos.col] = val;
  }

  return array;
}