import React, { memo, useEffect, useState } from 'react';

import { getUserListIfNeed } from 'client/store/slices/user-list-slice';
import request from 'client/api/request';

export const loadData = () => [getUserListIfNeed()];

const Home = () => {
  const [usdtTakerBybit, setUsdtTakerBybit] = useState('0');
  useEffect(async () => {
    console.log('here');
    const price = (await request.get('health')).data.data;
    console.log('price: ', price);
    setUsdtTakerBybit(price.usdtTakerBybit);
  }, []);

  return (
    <div className='container'>
      <div className='bybitTakerUSDT'>P2P Taker Bybit USDT {usdtTakerBybit}</div>
    </div>
  );
};

export default memo(Home);
