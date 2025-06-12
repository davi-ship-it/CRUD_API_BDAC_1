// bases/BodegaTypes.ts
export interface NewBodega {
  bod_nombre: string;
  bod_numero: string;    // antes era bod_zona
}

export interface Bodega extends NewBodega {
  pk_id_bodega: number;
}
