function drawGacha(gachaRates, gachaItems)
{
  const totalWeight     = gachaRates.reduce((sum, rate) => sum + rate.weight, 0);
  let randomWeight      = Math.random() * totalWeight;
  let selectedRarity    = "NONE";

  for (const rate of gachaRates) {
    if (randomWeight < rate.weight) {
      selectedRarity = rate.rarity;
      break;
    }
    randomWeight -= rate.weight;
  }

  const availableItems = gachaItems.filter(item => item.rarity === selectedRarity);
  const randomIndex    = Math.floor(Math.random() * availableItems.length);
  return availableItems[randomIndex];
}

module.exports = {
  drawGacha
};
