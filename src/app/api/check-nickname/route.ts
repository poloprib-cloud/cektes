import { NextRequest, NextResponse } from 'next/server';

async function hitCoda(body: string) {
  const response = await fetch('https://order-sg.codashop.com/initPayment.action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    body
  });
  return await response.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const server = searchParams.get('server') || searchParams.get('zone');
  const game = searchParams.get('game');

  if (!id) {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }

  let result;
  try {
    switch (game) {
      case 'ml':
        result = await ml(Number(id), Number(server));
        break;
      case 'ff':
        result = await ff(Number(id));
        break;
      case 'ag':
        result = await ag(Number(id));
        break;
      case 'aov':
        result = await aov(Number(id));
        break;
      case 'cod':
        result = await cod(Number(id));
        break;
      case 'gi':
        result = await gi(Number(id));
        break;
      case 'hi':
        result = await hi(Number(id));
        break;
      case 'hsr':
        result = await hsr(Number(id));
        break;
      case 'la':
        result = await la(Number(id), String(server));
        break;
      case 'lad':
        result = await lad(Number(id));
        break;
      case 'pb':
        result = await pb(Number(id));
        break;
      case 'pgr':
        result = await pgr(Number(id), String(server));
        break;
      case 'sus':
        result = await sus(Number(id));
        break;
      case 'valo':
        result = await valo(Number(id));
        break;
      case 'zzz':
        result = await zzz(Number(id));
        break;
      default:
        return NextResponse.json({ success: false, message: 'Game not supported' }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }
}

async function ml(id: number, zone: number) {
  const body = `voucherPricePoint.id=4150&voucherPricePoint.price=1579&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${zone}&voucherTypeName=MOBILE_LEGENDS&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: 'Mobile Legends: Bang Bang',
    id,
    server: zone,
    name: data.confirmationFields.username
  };
}

async function ff(id: number) {
  const body = `voucherPricePoint.id=8050&voucherPricePoint.price=1000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=FREEFIRE&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: 'Garena Free Fire',
    id,
    name: data.confirmationFields.roles[0].role
  };
}

async function ag(id: number) {
  const JWT1 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkeW5hbWljU2t1SW5mbyI6IntcInNrdUlkXCI6XCJjb20ueW9zdGFyLmFldGhlcmdhemVyLnNoaWZ0aW5nZmxvd2VyMVwiLFwiZXZlbnRQYWNrYWdlXCI6XCIwXCIsXCJkZW5vbUltYWdlVXJsXCI6XCJodHRwczovL2NkbjEuY29kYXNob3AuY29tL2ltYWdlcy81NDdfM2QyMTBiNzUtNTJkYi00YjUxLTgzMGYtZDYxMTFiNjFkNDQ5X0FFVEhFUiBHQVpFUl9pbWFnZS9Db2RhX0FHX1NLVWltYWdlcy82MC5wbmdcIixcImRlbm9tTmFtZVwiOlwiNjAgU2hpZnRpbmcgRmxvd2Vyc1wiLFwiZGVub21DYXRlZ29yeU5hbWVcIjpcIlNoaWZ0aW5nIEZsb3dlcnNcIixcInRhZ3NcIjpbXSxcImNvdW50cnkyTmFtZVwiOlwiSURcIixcImx2dElkXCI6MTE4NDAsXCJkZWZhdWx0UHJpY2VcIjoxNjY1MC4wLFwiZGVmYXVsdEN1cnJlbmN5XCI6XCJJRFJcIixcImFkZGl0aW9uYWxJbmZvXCI6e1wiRHluYW1pY1NrdVByb21vRGV0YWlsXCI6XCJudWxsXCJ9fSJ9.Ah9LA23iwtpoEEMORZ5giMSjgQ6MUDkAkwZifkpILjU';
  const JWT2 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkeW5hbWljU2t1SW5mbyI6IntcInBjSWRcIjoyMjcsXCJwcmljZVwiOjE2NjUwLjAsXCJjdXJyZW5jeVwiOlwiSURSXCIsXCJhcGlQcmljZVwiOjE2NjUwLjAsXCJhcGlQcmljZUN1cnJlbmN5XCI6XCJJRFJcIixcImRpc2NvdW50UHJpY2VcIjoxNjY1MC4wLFwicHJpY2VCZWZvcmVUYXhcIjoxNTAwMC4wLFwidGF4QW1vdW50XCI6MTY1MC4wLFwic2t1SWRcIjpcImNvbS55b3N0YXIuYWV0aGVyZ2F6ZXIuc2hpZnRpbmdmbG93ZXIxXCIsXCJsdnRJZFwiOjExODQwfSJ9.-Hs_g0kLoX41k5xgq7j9jScMzg3I-TlMAu5qj0U0Af4';
  const body = `voucherPricePoint.id=3&voucherPricePoint.price=16650&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=547-AETHER_GAZER&lvtId=11840&shopLang=id_ID&dynamicSkuToken=${JWT1}&pricePointDynamicSkuToken=${JWT2}`;
  const data = await hitCoda(body);
  if (data.confirmationFields.username) {
      return {
        success: true,
        game: 'Aether Gazer',
        id,
        name: data.confirmationFields.username
      };
    }
  else {
    return {
      success: false,
      message: 'Not found'
    };
  }
}

async function aov(id: number) {
  const body = `voucherPricePoint.id=7946&voucherPricePoint.price=10000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=AOV&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: 'Garena: AOV (Arena Of Valor)',
    id,
    name: data.confirmationFields.roles[0].role
  };
}

async function cod(id: number) {
  const body = `voucherPricePoint.id=46114&voucherPricePoint.price=5000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=CALL_OF_DUTY&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: 'Call Of Duty',
    id,
    name: data.confirmationFields.roles[0].role
  };
}

async function gi(id: number) {
  let sn = "";
  let sv = "";
  const idStr = String(id);

  switch (idStr[0]) {
    case "6":
      sn = "America";
      sv = "os_usa";
      break;
    case "7":
      sn = "Europe";
      sv = "os_euro";
      break;
    case "8":
      sn = "Asia";
      sv = "os_asia";
      break;
    case "9":
      sn = "SAR (Taiwan, Hong Kong, Macao)";
      sv = "os_cht";
      break;
    default:
      return {
        success: false,
        message: "Invalid ID for Genshin Impact",
      };
  }

  const body = `voucherPricePoint.id=116054&voucherPricePoint.price=16500&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=GENSHIN_IMPACT&shopLang=id_ID`;

  const data = await hitCoda(body);

  if (data.confirmationFields.username) {
    return {
      success: true,
      game: "Genshin Impact",
      id,
      server: sn,
      name: data.confirmationFields.username,
    };
  } else {
    return {
      success: false,
      message: "Not found",
    };
  }
}

async function hi(id: number) {
  const body = `voucherPricePoint.id=48250&voucherPricePoint.price=16500&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=&voucherTypeName=HONKAI_IMPACT&shopLang=id_ID`;
  const data = await hitCoda(body);
  if (data.confirmationFields.username) {
      return {
        success: true,
        game: 'Honkai Impact 3rd',
        id,
        name: data.confirmationFields.username
      };
    }
  else {
    return {
      success: false,
      message: 'Not found'
    };
  }
}

async function hsr(id: number) {
  let sn = "";
  let sv = "";
  const idStr = String(id);

  switch (idStr[0]) {
    case "6":
      sn = "America";
      sv = "prod_official_usa";
      break;
    case "7":
      sn = "Europe";
      sv = "prod_official_eur";
      break;
    case "8":
      sn = "Asia";
      sv = "prod_official_asia";
      break;
    case "9":
      sn = "SAR (Taiwan, Hong Kong, Macao)";
      sv = "prod_official_cht";
      break;
    default:
      return {
        success: false,
        message: "Invalid ID for Honkai: Star Rail",
      };
  }

  const body = `voucherPricePoint.id=855316&voucherPricePoint.price=16000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=HONKAI_STAR_RAIL&shopLang=id_ID`;

  const data = await hitCoda(body);

  if (data.confirmationFields.username) {
    return {
      success: true,
      game: "Honkai: Star Rail",
      id,
      server: sn,
      name: data.confirmationFields.username,
    };
  } else {
    return {
      success: false,
      message: "Not found",
    };
  }
}

async function la(id: number, zone: string) {
  const zoneLC = zone.toLowerCase();
  let sn = "";
  let sv = 0;
  const idStr = String(id);

  switch (true) {
    case zoneLC.includes('miskatown'):
      sn = 'MiskaTown';
      sv = 500001;
      break;
    case zoneLC.includes('sandcastle'):
      sn = 'SandCastle';
      sv = 500002;
      break;
    case zoneLC.includes('mouthswamp'):
      sn = 'MouthSwamp';
      sv = 500003
      break;
    case zoneLC.includes('redwoodtown'):
      sn = 'RedwoodTown';
      sv = 500004;
      break;
    case zoneLC.includes('obelisk'):
      sn = 'Obelisk';
      sv = 500005;
      break;
    case zoneLC.includes('newland'):
      sn = 'NewLand';
      sv = 500006;
      break;
    case zoneLC.includes('chaosoutpost'):
      sn = 'ChaosOutpost';
      sv = 500007;
      break;
    case zoneLC.includes('ironstride'):
      sn = 'IronStride';
      sv = 500008;
      break;
    case zoneLC.includes('crystalthornsea'):
      sn = 'CrystalthornSea';
      sv = 500009;
      break;
    case zoneLC.includes('fallforest'):
      sn = 'FallForest';
      sv = 510001;
      break;
    case zoneLC.includes('mountsnow'):
      sn = 'MountSnow';
      sv = 510002;
      break;
    case zoneLC.includes('nancycity'):
      sn = 'NancyCity';
      sv = 520001;
      break;
    case zoneLC.includes('charlestown'):
      sn = 'CharlesTown';
      sv = 520002;
      break;
    case zoneLC.includes('snowhighlands'):
      sn = 'SnowHighlands';
      sv = 520003;
      break;
    case zoneLC.includes('santopany'):
      sn = 'Santopany';
      sv = 520004;
      break;
    case zoneLC.includes('levincity'):
      sn = 'LevinCity';
      sv = 520005;
      break;
    case zoneLC.includes('milestone'):
      sn = 'MileStone';
      sv = 520006;
      break;
    case zoneLC.includes('chaoscity'):
      sn = 'ChaosCity';
      sv = 520007;
      break;
    case zoneLC.includes('twinislands'):
      sn = 'TwinIslands';
      sv = 520008;
      break;
    case zoneLC.includes('hopewall'):
      sn = 'HopeWall';
      sv = 520009;
      break;
    case zoneLC.includes('labyrinthsea'):
      sn = 'LabyrinthSea';
      sv = 520010;
      break;
    default:
      return {
        success: false,
        message: 'Not found',
      };
  }

  const body = `voucherPricePoint.id=45713&voucherPricePoint.price=15000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=NETEASE_LIFEAFTER&shopLang=id_ID`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: "LifeAfter",
    id,
    server: sn,
    name: data.confirmationFields.username,
  };
}

async function lad(id: number) {
  const JWT1 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkeW5hbWljU2t1SW5mbyI6IntcInNrdUlkXCI6XCIxXzEwMDBcIixcImV2ZW50UGFja2FnZVwiOlwiMFwiLFwiZGVub21JbWFnZVVybFwiOlwiaHR0cHM6Ly9jZG4xLmNvZGFzaG9wLmNvbS9pbWFnZXMvOTE2XzQ0Y2MyNmU3LWU3NDctNDk4NS04MzQ1LWZmODFjMGUwM2QxN19MT1ZFIEFORCBERUVQU1BBQ0VfaW1hZ2UvNjAgQ3J5c3RhbHMucG5nXCIsXCJkZW5vbU5hbWVcIjpcIjYwIENyeXN0YWxzXCIsXCJkZW5vbUNhdGVnb3J5TmFtZVwiOlwiQ3J5c3RhbFwiLFwidGFnc1wiOltdLFwiY291bnRyeTJOYW1lXCI6XCJJRFwiLFwibHZ0SWRcIjoxMTY4NCxcImRlZmF1bHRQcmljZVwiOjE5MDAwLjAsXCJkZWZhdWx0Q3VycmVuY3lcIjpcIklEUlwiLFwiYWRkaXRpb25hbEluZm9cIjp7XCJEeW5hbWljU2t1UHJvbW9EZXRhaWxcIjpcIm51bGxcIixcIkxveWFsdHlDdXJyZW5jeURldGFpbFwiOlwie1xcXCJwcmljaW5nU2NoZW1lXFxcIjpcXFwicGFpZF9jdXJyZW5jeVxcXCIsXFxcImxveWFsdHlFYXJuZWRBbW91bnRcXFwiOjAuMCxcXFwibG95YWx0eUJ1cm5lZEFtb3VudFxcXCI6MC4wfVwifX0ifQ.VsI9fduPyRDA1t_GOQ65cR88HJc_a93ROdy8Fsg8bEw';
  const JWT2 = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkeW5hbWljU2t1SW5mbyI6IntcInBjSWRcIjoyMjcsXCJwcmljZVwiOjE5MDAwLjAsXCJjdXJyZW5jeVwiOlwiSURSXCIsXCJhcGlQcmljZVwiOjE5MDAwLjAsXCJhcGlQcmljZUN1cnJlbmN5XCI6XCJJRFJcIixcImRpc2NvdW50UHJpY2VcIjoxOTAwMC4wLFwicHJpY2VCZWZvcmVUYXhcIjoxNzExNy4wLFwidGF4QW1vdW50XCI6MTg4My4wLFwic2t1SWRcIjpcIjFfMTAwMFwiLFwibHZ0SWRcIjoxMTY4NH0ifQ.nAclaCSG5o2xD9ccUuWTn3g8nC8Z7_nIDtj_qbCyQ0M';
  const body = `voucherPricePoint.id=3&voucherPricePoint.price=19000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=INFOLD_GAMES-LOVE_AND_DEEPSPACE&lvtId=11684&shopLang=id_ID&dynamicSkuToken=${JWT1}&pricePointDynamicSkuToken=${JWT2}`;
  const data = await hitCoda(body);
  if (data.confirmationFields.username) {
      return {
        success: true,
        game: 'Love and Deepspace',
        id,
        name: data.confirmationFields.username
      };
    }
  else {
    return {
      success: false,
      message: 'Not found'
    };
  }
}

async function pb(id: number) {
  const body = `voucherPricePoint.id=54700&voucherPricePoint.price=11000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=&voucherTypeName=POINT_BLANK&shopLang=id_ID`;
  const data = await hitCoda(body);
  if (data.confirmationFields.username) {
      return {
        success: true,
        game: 'Point Blank',
        id,
        name: data.confirmationFields.username
      };
    }
  else {
    return {
      success: false,
      message: 'Not found'
    };
  }
}

async function pgr(id: number, zone: string) {
  let sn = "";
  let sv = "";
  switch (zone.toLowerCase()) {
    case 'ap':
      sn = 'Asia-Pacific';
      sv = '5000';
      break;
    case 'eu':
      sn = 'Europe';
      sv = '5001';
      break;
    case 'na':
      sn = 'North America';
      sv = '5002';
      break
    default:
      return {
        success: false,
        message: 'Bad request',
      };
  }

  const body = `voucherPricePoint.id=259947&voucherPricePoint.price=15000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=PUNISHING_GRAY_RAVEN&shopLang=id_ID`;

  const data = await hitCoda(body);
  return {
    success: true,
    game: "Punishing: Gray Raven",
    id,
    server: sn,
    name: data.confirmationFields.username,
  };
}

async function sus(id: number) {
  const body = `voucherPricePoint.id=256513&voucherPricePoint.price=16000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=global-release&voucherTypeName=SAUSAGE_MAN&shopLang=id_ID`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: 'Sausage Man',
    id,
    name: data.confirmationFields.username
  };
}

async function valo(id: number) {
  const body = `voucherPricePoint.id=973634&voucherPricePoint.price=56000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=VALORANT&voucherTypeId=109&gvtId=139&shopLang=id_ID`;
  const data = await hitCoda(body);
  if (data.success === true) {
    return {
      success: true,
      game: 'VALORANT',
      id,
      server: 'Indonesia',
      name: data.confirmationFields.username
    };
  } else if (data.errorCode === -200) {
    return {
      success: true,
      game: 'VALORANT',
      id,
      name: id
    };
  } else {
    return {
      success: false,
      message: 'Not found'
    };
  }
}

async function zzz(id: number) {
  let sn = "";
  let sv = "";
  const idStr = id.toString().substring(0, 2);

  switch (idStr) {
    case "10":
      sn = "America";
      sv = "prod_gf_us";
      break;
    case "13":
      sn = "Asia";
      sv = "prod_gf_jp";
      break;
    case "15":
      sn = "Europe";
      sv = "prod_gf_eu";
      break;
    case "17":
      sn = "SAR (Taiwan, Hong Kong, Macao)";
      sv = "prod_gf_sg";
      break;
    default:
      return {
        success: false,
        message: "Invalid ID for Zenless Zone Zero",
      };
  }

  const body = `voucherPricePoint.id=946399&voucherPricePoint.price=16000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=ZENLESS_ZONE_ZERO&shopLang=id_ID`;

  const data = await hitCoda(body);
  return {
    success: true,
    game: "Zenless Zone Zero",
    id,
    server: sn,
    name: data.confirmationFields.username,
  };

}