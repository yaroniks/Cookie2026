from app.database.redis import redis_service

import aiohttp
import xml.etree.ElementTree as et

TARGET_CURRENCIES = {
    "USD": "Доллар США",
    "EUR": "Евро",
    "GBP": "Фунт стерлингов",
    "CNY": "Юань",
    "UAH": "Гривна",
}


@redis_service.cache(key='currencies', expire=1800)
async def parse_currencies(session: aiohttp.ClientSession) -> list[dict]:
    async with session.get('https://www.cbr.ru/scripts/XML_daily.asp') as response:
        xml = await response.text()
    root = et.fromstring(xml)
    result = []

    for valute in root.findall("Valute"):
        char_code = valute.findtext("CharCode", "").strip()
        if char_code not in TARGET_CURRENCIES:
            continue

        nominal = int(valute.findtext("Nominal", "1"))
        value = float(valute.findtext("Value", "0").replace(",", "."))
        unit_rate = float(valute.findtext("VunitRate", "0").replace(",", "."))
        name = TARGET_CURRENCIES[char_code]

        result.append({
            'char_code': char_code,
            'nominal': nominal,
            'name': name,
            'value': value,
            'unit_rate': unit_rate
        })

    return result
