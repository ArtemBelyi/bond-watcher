import { InstrumentStatus } from '@ttech-pub/grpc-node-client';
import { type Bond, type FavoriteInstrument, BaseInstrument } from '../../ports.js';

import {
  mapBond,
  mapFavorite,
} from './instruments.utils.js';

export class BondSource extends BaseInstrument<Bond> {
  async getAll(): Promise<Bond[]> {
    const res = await this.request(() => this.client.instruments.bonds({ instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE }));
    return res.instruments.map(mapBond);
  }
}

export class FavoritesSource extends BaseInstrument<FavoriteInstrument> {
  async getAll(): Promise<FavoriteInstrument[]> {
    const res = await this.request(() => this.client.instruments.getFavorites({}));
    return res.favoriteInstruments.map(mapFavorite);
  }
}
