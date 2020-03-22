// const margin = ({top: 20, right: 20, bottom: 20, left: 20});
const width = 920;
const height = 450;

const countries = {
  "จีน": "China",
  "ญี่ปุ่น": "Japan",
  "เกาหลีใต้": "South Korea",
  "สิงคโปร์": "Singapore",
  "ฮ่องกง": "Hong Kong",
  "อิหร่าน": "Iran",
  "อิตาลี": "Italy",
  "อียิปต์": "Egypt",
  "ออสเตรเลีย": "Australia",
  "ฝรั่งเศส": "France",
  "เยอรมนี": "Germany",
}

const symbol_size = 15;
let dodge = (data) => {
  let data_by_country = d3.nest().key(d => countries[d.country]).object(data);

  let counts = {};
  data.forEach((d, i) => {
    let country = countries[d.country];
    if (counts[country] != undefined) {
      counts[country]++;
    } else {
      counts[country] = 0
    }

    let n = data_by_country[country].length;
    let radius = (n === 1) ? 0 : 0.8*symbol_size * Math.sqrt(2 / (1-Math.cos(2*Math.PI/n))); // from cosine law
    let angle = (counts[country] / n) * 2*Math.PI;

    [cx, cy] = path.centroid(features_by_name[country][0]);
    data[i].xy = [cx + radius*Math.cos(angle), cy + radius*Math.sin(angle)]
  });

  return data;
}

function polygon(sides) {
  let length = sides*2;
  let s = 1;
  let phase = 0;

  const radial = d3.lineRadial()
    .curve(d3.curveLinearClosed)
    .angle((_, i) => (i / length) * 2 * Math.PI + phase)
    .radius((_, i) => (i % 2 === 0) ? s : s-5);

  const poly = () => radial(Array.from({ length }));
  poly.context = (_) => arguments.length ? (radial.context(_), poly) : radial.context();
  poly.n = (_) => arguments.length ? ((length = +_), poly) : length;
  poly.rotate = (_) => arguments.length ? ((phase = +_), poly) : phase;
  poly.scale = (_) => arguments.length ? ((s = +_), poly) : s;
  poly.curve = (_) => arguments.length ? (radial.curve(_), poly) : radial.curve();
  poly.radius = radial.radius;
  poly.angle = radial.angle;
  return poly;
}

const path = d3.geoPath(d3.geoEqualEarth());
const svg = d3.select('#chart')
  .append('svg')
    .attr("viewBox", [0, 0, width, height])
  //   .attr('width', width + margin.left + margin.right)
  //   .attr('height', height + margin.top + margin.bottom)
  // .append('g')
  //   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
const features = topojson.feature(world, world.objects.countries).features;
const features_by_name = d3.nest().key(d => d.properties.name).object(features);
svg.append("g")
  .selectAll("path")
  .data(features)
  .join("path")
    .attr("fill", "gainsboro")
    .attr("stroke", "white")
    .attr("stroke-width", "0.5")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

const threshold = 1;
d3.csv('data.csv').then(data => {
  data = data.filter(d => d.infected > threshold*2)

  // TODO color for newness
  svg.append("g")
      .attr("fill", "darkgreen")
      .attr("fill-opacity", 0.5)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
    .selectAll("path")
    .data(dodge(data))
    .join("path")
      .attr("transform", d => `translate(${d.xy})`)
      .attr("d", d => `${polygon(Math.floor(d.infected/threshold))
        // .curve(d3.curveCardinalClosed)
        .scale(symbol_size)() //(Math.floor(d.data.infected/threshold))()
      }`)
    .append("title")
      .text(d => `เหตุการณ์ที่${d.location} เมือง${d.city} ประเทศ${d.country} เมื่อวันที่ ${d.date} มีผู้ติดเชื้อ ${d.infected} คน`);
});