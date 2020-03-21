const margin = ({top: 20, right: 20, bottom: 30, left: 20});
const width = 1000;
const height = 500;

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
    .attr("stroke-linejoin", "round")
    .attr("d", path);

d3.csv('data.csv').then(data => {
  data = data.filter(d => d.infected > 100)

  // TODO color for newness
  svg.append("g")
      .attr("fill", "darkgreen")
      .attr("fill-opacity", 0.5)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
    .selectAll("path")
    .data(data)
    .join("path")
      .attr("transform", d => `translate(${path.centroid(features_by_name[countries[d.country]][0])})`)
      .attr("d", d => `${polygon(Math.floor(d.infected/100))
        // .curve(d3.curveCardinalClosed)
        .scale(20)() //(Math.floor(d.data.infected/100))()
      }`)
    .append("title")
      .text(d => `${countries[d.country]}`);
});