const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const q = (prompt, answer, worked) => ({ prompt, answer: Math.round(answer * 10000) / 10000, worked });

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = (n) => String(n).split('').map((d) => SUP[d] || d).join('');
const money = (n) => `£${Number(n).toFixed(2)}`;

const PYTHAGOREAN_TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
  [20, 21, 29],
];

export const TOPICS = [
  {
    id: 'arithmetic',
    name: 'Number skills',
    strand: 'Number',
    icon: 'hash',
    blurb: 'Adding, subtracting and times tables',
    generate(tier) {
      if (tier === 1) {
        const a = rnd(14, 68);
        const b = rnd(14, 49);
        return q(`${a} + ${b}`, a + b, `${a} + ${b} = ${a + b}`);
      }
      if (tier === 2) {
        const a = rnd(11, 29);
        const b = rnd(3, 9);
        return q(`${a} × ${b}`, a * b, `${a} × ${b} = ${a * b}`);
      }
      if (tier === 3) {
        const a = rnd(34, 96);
        const b = rnd(3, 8);
        return q(
          `${a} × ${b}`,
          a * b,
          `Split ${a} into ${Math.floor(a / 10) * 10} and ${a % 10}: ${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}, and ${a % 10} × ${b} = ${(a % 10) * b}. Add them to get ${a * b}.`
        );
      }
      if (tier === 4) {
        const a = rnd(4, 25);
        const b = rnd(a + 3, a + 32);
        return q(`${a} − ${b}`, a - b, `${a} − ${b} goes ${b - a} below zero, so the answer is −${b - a}.`);
      }
      const a = rnd(4, 12);
      const b = rnd(3, 9);
      const c = rnd(2, 12);
      return q(`${a} + ${b} × ${c}`, a + b * c, `Multiplication comes first: ${b} × ${c} = ${b * c}, then add ${a}.`);
    },
  },
  {
    id: 'fractions',
    name: 'Fractions',
    strand: 'Number',
    icon: 'divide',
    blurb: 'Fractions of amounts and adding fractions',
    generate(tier) {
      if (tier <= 2) {
        const b = tier === 1 ? 2 : pick([4, 5]);
        const a = tier === 1 ? 1 : rnd(1, b - 1);
        const n = b * rnd(4, 12);
        return q(
          `What is ${a}/${b} of ${n}?`,
          (a * n) / b,
          `Divide ${n} by ${b} to get ${n / b}, then multiply by ${a} to get ${(a * n) / b}.`
        );
      }
      if (tier === 3) {
        const b = pick([8, 10]);
        const a = rnd(1, b - 1);
        const n = b * rnd(3, 12);
        return q(
          `What is ${a}/${b} of ${n}?`,
          (a * n) / b,
          `One ${b}th of ${n} is ${n / b}, so ${a} of them is ${(a * n) / b}.`
        );
      }
      if (tier === 4) {
        const d = pick([4, 5, 8, 10]);
        const a = rnd(1, Math.floor(d / 2));
        const b = rnd(1, Math.max(1, d - a - 1));
        return q(
          `${a}/${d} + ${b}/${d}`,
          (a + b) / d,
          `The denominators already match, so add the numerators: ${a} + ${b} = ${a + b}, giving ${a + b}/${d}.`
        );
      }
      const x = pick([2, 4, 5, 10]);
      const y = pick([2, 4, 5, 10].filter((v) => v !== x));
      const answer = 1 / x + 1 / y;
      return q(
        `1/${x} + 1/${y}`,
        answer,
        `Make both denominators the same, add, then simplify. As a decimal that is ${answer.toFixed(2)}.`
      );
    },
  },
  {
    id: 'percentages',
    name: 'Percentages',
    strand: 'Number',
    icon: 'percent',
    blurb: 'Of amounts, increases and decreases',
    generate(tier) {
      if (tier === 1) {
        const n = rnd(2, 20) * 10;
        return q(`What is 50% of ${n}?`, n / 2, `50% is a half, so half of ${n} is ${n / 2}.`);
      }
      if (tier === 2) {
        const n = rnd(3, 40) * 10;
        const p = pick([10, 25]);
        return q(
          `What is ${p}% of ${n}?`,
          (n * p) / 100,
          `${p}% of ${n} = ${n} × ${p / 100} = ${(n * p) / 100}.`
        );
      }
      if (tier === 3) {
        const n = rnd(4, 40) * 5;
        const p = pick([5, 20]);
        return q(`What is ${p}% of ${n}?`, (n * p) / 100, `${n} ÷ 100 = ${n / 100}, times ${p} = ${(n * p) / 100}.`);
      }
      if (tier === 4) {
        const n = rnd(2, 20) * 10;
        const p = pick([10, 20, 30]);
        return q(
          `A ticket costs ${money(n)}. The price goes up by ${p}%. What is the new price?`,
          n * (1 + p / 100),
          `${p}% of ${money(n)} is ${money((n * p) / 100)}, so the new price is ${money(n * (1 + p / 100))}.`
        );
      }
      const n = rnd(2, 20) * 10;
      const p = pick([10, 15, 20, 25]);
      return q(
        `A coat costs ${money(n)} and is reduced by ${p}%. What is the sale price?`,
        n * (1 - p / 100),
        `${p}% of ${money(n)} is ${money((n * p) / 100)}. Subtract that from ${money(n)} to get ${money(n * (1 - p / 100))}.`
      );
    },
  },
  {
    id: 'powers',
    name: 'Powers & roots',
    strand: 'Number',
    icon: 'sigma',
    blurb: 'Squares, cubes, roots and index laws',
    generate(tier) {
      if (tier === 1) {
        const n = rnd(2, 12);
        return q(`What is ${n}²?`, n * n, `${n}² means ${n} × ${n} = ${n * n}.`);
      }
      if (tier === 2) {
        const n = rnd(2, 12);
        return q(`What is √${n * n}?`, n, `${n} × ${n} = ${n * n}, so the square root is ${n}.`);
      }
      if (tier === 3) {
        const n = rnd(2, 5);
        return q(`What is ${n}³?`, n ** 3, `${n}³ means ${n} × ${n} × ${n} = ${n ** 3}.`);
      }
      if (tier === 4) {
        const a = rnd(2, 9);
        const b = rnd(2, 7);
        return q(`${a}² + ${b}²`, a * a + b * b, `${a}² = ${a * a} and ${b}² = ${b * b}, so the total is ${a * a + b * b}.`);
      }
      const a = rnd(2, 6);
      const b = rnd(2, 6);
      return q(
        `2${sup(a)} × 2${sup(b)} = 2${sup('k')}. What is k?`,
        a + b,
        `When you multiply powers of the same base you add the indices: ${a} + ${b} = ${a + b}.`
      );
    },
  },
  {
    id: 'equations',
    name: 'Linear equations',
    strand: 'Algebra',
    icon: 'scale',
    blurb: 'Solve for x, including brackets',
    generate(tier) {
      if (tier === 1) {
        const x = rnd(2, 12);
        const a = rnd(3, 19);
        return q(`Solve x + ${a} = ${x + a}`, x, `Subtract ${a} from both sides: x = ${x}.`);
      }
      if (tier === 2) {
        const a = rnd(2, 9);
        const x = rnd(2, 12);
        return q(`Solve ${a}x = ${a * x}`, x, `Divide both sides by ${a}: x = ${x}.`);
      }
      if (tier === 3) {
        const a = rnd(2, 7);
        const x = rnd(2, 9);
        const b = rnd(2, 15);
        return q(
          `Solve ${a}x + ${b} = ${a * x + b}`,
          x,
          `Subtract ${b} to get ${a}x = ${a * x}, then divide by ${a}: x = ${x}.`
        );
      }
      if (tier === 4) {
        const a = rnd(2, 7);
        const x = rnd(2, 9);
        const b = rnd(2, 9);
        return q(
          `Solve ${a}x − ${b} = ${a * x - b}`,
          x,
          `Add ${b} to both sides to get ${a}x = ${a * x}, then divide by ${a}: x = ${x}.`
        );
      }
      const a = rnd(2, 5);
      const x = rnd(2, 9);
      const b = rnd(2, 8);
      return q(
        `Solve ${a}(x + ${b}) = ${a * (x + b)}`,
        x,
        `Divide both sides by ${a} to get x + ${b} = ${x + b}, then subtract ${b}: x = ${x}.`
      );
    },
  },
  {
    id: 'substitution',
    name: 'Substitution',
    strand: 'Algebra',
    icon: 'replace',
    blurb: 'Work out expressions for a given value',
    generate(tier) {
      const x = rnd(2, 9);
      if (tier === 1) {
        const a = rnd(3, 15);
        return q(`If x = ${x}, work out x + ${a}`, x + a, `Replace x with ${x}: ${x} + ${a} = ${x + a}.`);
      }
      if (tier === 2) {
        const a = rnd(2, 7);
        const b = rnd(2, 9);
        return q(
          `If x = ${x}, work out ${a}x − ${b}`,
          a * x - b,
          `${a}x means ${a} × ${x} = ${a * x}, then subtract ${b}.`
        );
      }
      if (tier === 3) {
        const a = rnd(3, 8);
        const b = rnd(3, 12);
        return q(`If y = ${x}, work out ${a}y + ${b}`, a * x + b, `${a} × ${x} = ${a * x}, plus ${b} gives ${a * x + b}.`);
      }
      if (tier === 4) {
        const a = rnd(2, 9);
        return q(`If x = ${x}, work out x² + ${a}`, x * x + a, `x² = ${x} × ${x} = ${x * x}, then add ${a}.`);
      }
      const a = rnd(2, 4);
      const b = rnd(2, 9);
      return q(
        `If x = ${x}, work out ${a}x² − ${b}`,
        a * x * x - b,
        `x² = ${x * x}, so ${a}x² = ${a * x * x}. Subtract ${b} to get ${a * x * x - b}.`
      );
    },
  },
  {
    id: 'sequences',
    name: 'Sequences',
    strand: 'Algebra',
    icon: 'list',
    blurb: 'Next terms and the nth term rule',
    generate(tier) {
      if (tier <= 2) {
        const start = rnd(1, 12);
        const step = tier === 1 ? rnd(2, 6) : rnd(4, 11);
        const shown = [0, 1, 2, 3].map((i) => start + i * step);
        return q(
          `The sequence is ${shown.join(', ')}, … What is the next term?`,
          start + 4 * step,
          `Each term goes up by ${step}, so ${shown[3]} + ${step} = ${start + 4 * step}.`
        );
      }
      if (tier === 3) {
        const a = rnd(2, 7);
        const b = rnd(1, 6);
        return q(
          `The nth term of a sequence is ${a}n + ${b}. What is the 10th term?`,
          a * 10 + b,
          `Substitute n = 10: ${a} × 10 + ${b} = ${a * 10 + b}.`
        );
      }
      if (tier === 4) {
        const a = rnd(3, 9);
        const b = rnd(1, 9);
        return q(
          `The nth term of a sequence is ${a}n − ${b}. What is the 20th term?`,
          a * 20 - b,
          `Substitute n = 20: ${a} × 20 = ${a * 20}, minus ${b} gives ${a * 20 - b}.`
        );
      }
      const a = rnd(2, 6);
      const b = rnd(1, 8);
      const n = rnd(8, 25);
      const value = a * n + b;
      return q(
        `A sequence has nth term ${a}n + ${b}. Which term in the sequence has the value ${value}?`,
        n,
        `Solve ${a}n + ${b} = ${value}: n = (${value} − ${b}) ÷ ${a} = ${n}.`
      );
    },
  },
  {
    id: 'angles',
    name: 'Angles',
    strand: 'Geometry',
    icon: 'triangle',
    blurb: 'Triangles, straight lines and points',
    generate(tier) {
      if (tier === 1) {
        const a = rnd(30, 80);
        const b = rnd(25, 170 - a);
        return q(
          `Two angles in a triangle are ${a}° and ${b}°. What is the third angle?`,
          180 - a - b,
          `Angles in a triangle add to 180°: 180 − ${a} − ${b} = ${180 - a - b}°.`
        );
      }
      if (tier === 2) {
        const a = rnd(35, 145);
        return q(`Two angles on a straight line are ${a}° and x. What is x?`, 180 - a, `Angles on a straight line add to 180°: 180 − ${a} = ${180 - a}°.`);
      }
      if (tier === 3) {
        const a = rnd(30, 75);
        return q(
          `An isosceles triangle has base angles of ${a}°. What is the angle between the two equal sides?`,
          180 - 2 * a,
          `The two base angles are equal, so 180 − ${a} − ${a} = ${180 - 2 * a}°.`
        );
      }
      if (tier === 4) {
        const a = rnd(60, 130);
        const b = rnd(50, 340 - a - 40);
        const c = rnd(30, 360 - a - b - 20);
        return q(
          `Three angles meet at a point. Two of them are ${a}° and ${b}°, and so is the third. What is the fourth angle?`,
          360 - a - b - c,
          `Angles around a point add to 360°: 360 − ${a} − ${b} − ${c} = ${360 - a - b - c}°.`
        );
      }
      const a = rnd(25, 80);
      const b = rnd(25, 80);
      return q(
        `In a triangle, the two angles opposite an exterior angle are ${a}° and ${b}°. What is the exterior angle?`,
        a + b,
        `The exterior angle equals the sum of the two opposite interior angles: ${a} + ${b} = ${a + b}°.`
      );
    },
  },
  {
    id: 'area',
    name: 'Area & perimeter',
    strand: 'Geometry',
    icon: 'ruler',
    blurb: 'Rectangles, triangles and circles',
    generate(tier) {
      if (tier === 1) {
        const a = rnd(4, 18);
        const b = rnd(3, 14);
        return q(`A rectangle is ${a} cm by ${b} cm. What is its area in cm²?`, a * b, `Area = length × width = ${a} × ${b} = ${a * b} cm².`);
      }
      if (tier === 2) {
        const base = rnd(8, 24);
        const height = pick([2, 4, 6, 8, 10]);
        return q(
          `A triangle has base ${base} cm and height ${height} cm. What is its area in cm²?`,
          (base * height) / 2,
          `Area = ½ × base × height = ½ × ${base} × ${height} = ${(base * height) / 2} cm².`
        );
      }
      if (tier === 3) {
        const a = rnd(4, 18);
        const b = rnd(3, 14);
        return q(
          `A rectangle is ${a} cm long and ${b} cm wide. What is its perimeter in cm?`,
          2 * (a + b),
          `Perimeter = 2 × (${a} + ${b}) = ${2 * (a + b)} cm.`
        );
      }
      if (tier === 4) {
        const r = rnd(2, 9);
        const area = Math.round(Math.PI * r * r * 10) / 10;
        return q(
          `A circle has radius ${r} cm. Use π = 3.14 to find its area in cm², to 1 decimal place.`,
          Math.round(3.14 * r * r * 10) / 10,
          `Area = πr² = 3.14 × ${r}² = ${area} cm².`
        );
      }
      const r = rnd(2, 9);
      return q(
        `A circle has radius ${r} cm. Use π = 3.14 to find its circumference in cm, to 1 decimal place.`,
        Math.round(2 * 3.14 * r * 10) / 10,
        `Circumference = 2πr = 2 × 3.14 × ${r} = ${Math.round(2 * 3.14 * r * 10) / 10} cm.`
      );
    },
  },
  {
    id: 'pythagoras',
    name: 'Pythagoras',
    strand: 'Geometry',
    icon: 'square',
    blurb: 'Missing sides in right-angled triangles',
    generate(tier) {
      if (tier === 1 || tier === 2) {
        const [a, b, c] = pick(tier === 1 ? PYTHAGOREAN_TRIPLES.slice(0, 4) : PYTHAGOREAN_TRIPLES);
        return q(
          `A right-angled triangle has shorter sides of ${a} cm and ${b} cm. How long is the hypotenuse?`,
          c,
          `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, and √${c * c} = ${c} cm.`
        );
      }
      if (tier === 3 || tier === 4) {
        const [a, b, c] = pick(PYTHAGOREAN_TRIPLES);
        return q(
          `A right-angled triangle has a hypotenuse of ${c} cm and one shorter side of ${b} cm. How long is the other shorter side?`,
          a,
          `${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}, and √${a * a} = ${a} cm.`
        );
      }
      let a = rnd(3, 9);
      let b = rnd(3, 9);
      while (Number.isInteger(Math.sqrt(a * a + b * b))) {
        a = rnd(3, 9);
        b = rnd(3, 9);
      }
      const hyp = Math.round(Math.sqrt(a * a + b * b) * 10) / 10;
      return q(
        `A right-angled triangle has shorter sides of ${a} cm and ${b} cm. How long is the hypotenuse, to 1 decimal place?`,
        hyp,
        `${a}² + ${b}² = ${a * a + b * b}, and √${a * a + b * b} = ${hyp} cm.`
      );
    },
  },
  {
    id: 'ratio',
    name: 'Ratio',
    strand: 'Ratio',
    icon: 'split',
    blurb: 'Sharing amounts in a given ratio',
    generate(tier) {
      if (tier === 1) {
        const n = rnd(2, 9);
        const part = rnd(3, 12) * (n + 1);
        return q(
          `£${part} is shared between two people in the ratio 1:${n}. What is the larger share, in pounds?`,
          (part * n) / (n + 1),
          `${n + 1} parts in total, so one part is £${part / (n + 1)}. The larger share is ${n} parts = £${(part * n) / (n + 1)}.`
        );
      }
      if (tier === 2 || tier === 3) {
        const a = rnd(1, 5);
        const b = rnd(a + 2, a + 6);
        const unit = rnd(3, 12);
        const total = (a + b) * unit;
        const larger = tier === 2;
        return q(
          `£${total} is shared in the ratio ${a}:${b}. What is the ${larger ? 'larger' : 'smaller'} share, in pounds?`,
          (larger ? b : a) * unit,
          `${a} + ${b} = ${a + b} parts, so one part is £${unit}. The ${larger ? 'larger' : 'smaller'} share is ${larger ? b : a} parts = £${(larger ? b : a) * unit}.`
        );
      }
      if (tier === 4) {
        const a = rnd(2, 5);
        const b = rnd(3, 8);
        const unit = rnd(3, 11);
        return q(
          `The ratio of A to B is ${a}:${b}. If A = ${a * unit}, what is B?`,
          b * unit,
          `A is ${a} parts, so one part is ${unit}. B is ${b} parts = ${b * unit}.`
        );
      }
      const a = rnd(1, 4);
      const b = rnd(2, 5);
      const c = rnd(3, 6);
      const unit = rnd(4, 12);
      const total = (a + b + c) * unit;
      const largest = Math.max(a, b, c);
      return q(
        `£${total} is shared in the ratio ${a}:${b}:${c}. What is the largest share, in pounds?`,
        largest * unit,
        `${a} + ${b} + ${c} = ${a + b + c} parts, so one part is £${unit}. The largest share is ${largest} parts = £${largest * unit}.`
      );
    },
  },
  {
    id: 'proportion',
    name: 'Proportion',
    strand: 'Ratio',
    icon: 'gauge',
    blurb: 'Best value, speed and direct proportion',
    generate(tier) {
      if (tier === 1) {
        const unit = rnd(2, 9);
        const n = rnd(3, 9);
        return q(
          `${n} pens cost ${money(unit * n)}. How much does 1 pen cost, in pounds?`,
          unit,
          `${unit * n} ÷ ${n} = ${unit}, so one pen costs ${money(unit)}.`
        );
      }
      if (tier === 2) {
        const unit = rnd(2, 9);
        const n = rnd(3, 9);
        const m = rnd(3, 12);
        return q(
          `${n} notebooks cost ${money(unit * n)}. How much do ${m} notebooks cost, in pounds?`,
          unit * m,
          `One notebook is ${money(unit)}, so ${m} cost ${money(unit * m)}.`
        );
      }
      if (tier === 3) {
        const speed = rnd(4, 12) * 10;
        const time = rnd(2, 5);
        return q(
          `A cyclist travels ${speed * time} km in ${time} hours. What is the average speed in km/h?`,
          speed,
          `Speed = distance ÷ time = ${speed * time} ÷ ${time} = ${speed} km/h.`
        );
      }
      if (tier === 4) {
        const speed = rnd(4, 12) * 10;
        const time = rnd(2, 6);
        return q(
          `A train travels at ${speed} km/h. How long does it take to cover ${speed * time} km, in hours?`,
          time,
          `Time = distance ÷ speed = ${speed * time} ÷ ${speed} = ${time} hours.`
        );
      }
      const k = rnd(2, 6);
      const x1 = rnd(2, 8);
      const x2 = rnd(3, 11);
      return q(
        `y is directly proportional to x. When x = ${x1}, y = ${k * x1}. What is y when x = ${x2}?`,
        k * x2,
        `y = ${k}x, so when x = ${x2}, y = ${k} × ${x2} = ${k * x2}.`
      );
    },
  },
  {
    id: 'averages',
    name: 'Mean & median',
    strand: 'Data',
    icon: 'chart',
    blurb: 'Averages, missing values and range',
    generate(tier) {
      if (tier <= 2) {
        const m = rnd(4, 15);
        const values = tier === 1 ? [m - 2, m, m + 2] : [m - 3, m - 1, m + 1, m + 3];
        return q(
          `What is the mean of ${values.join(', ')}?`,
          m,
          `Add them to get ${m * values.length}, then divide by ${values.length}: ${m}.`
        );
      }
      if (tier === 3) {
        const m = rnd(6, 14);
        const values = [rnd(2, m - 2), m, m + rnd(0, 3)];
        const missing = 4 * m - values.reduce((s, v) => s + v, 0);
        return q(
          `The mean of ${values.join(', ')} and x is ${m}. What is x?`,
          missing,
          `The total must be 4 × ${m} = ${4 * m}. The four numbers sum to ${values.reduce((s, v) => s + v, 0)}, so x = ${missing}.`
        );
      }
      if (tier === 4) {
        const numbers = [];
        while (numbers.length < 5) {
          const n = rnd(2, 40);
          if (!numbers.includes(n)) numbers.push(n);
        }
        const sorted = [...numbers].sort((a, b) => a - b);
        return q(
          `What is the median of ${numbers.join(', ')}?`,
          sorted[2],
          `In order: ${sorted.join(', ')}. The middle value is ${sorted[2]}.`
        );
      }
      const numbers = [];
      while (numbers.length < 6) {
        const n = rnd(2, 45);
        if (!numbers.includes(n)) numbers.push(n);
      }
      const range = Math.max(...numbers) - Math.min(...numbers);
      return q(`What is the range of ${numbers.join(', ')}?`, range, `Range = largest − smallest = ${Math.max(...numbers)} − ${Math.min(...numbers)} = ${range}.`);
    },
  },
  {
    id: 'probability',
    name: 'Probability',
    strand: 'Data',
    icon: 'dice',
    blurb: 'Single events, coins, dice and bags',
    generate(tier) {
      if (tier === 1) {
        return q('A fair coin is flipped once. What is the probability it lands on heads?', 0.5, 'One outcome out of two equally likely outcomes: 1/2 = 0.5.');
      }
      if (tier === 2) {
        const options = [
          ['an even number', 3, 'even numbers are 2, 4 and 6, so 3 out of 6'],
          ['a number greater than 4', 2, 'only 5 and 6, so 2 out of 6'],
          ['a number less than 3', 2, 'only 1 and 2, so 2 out of 6'],
        ];
        const [label, count, why] = pick(options);
        return q(
          `A fair dice is rolled once. What is the probability of rolling ${label}?`,
          count / 6,
          `${count} out of 6 outcomes (${why}) = ${(count / 6).toFixed(2)}.`
        );
      }
      if (tier === 3) {
        const options = [
          ['a prime number', 3, '2, 3 and 5 are prime'],
          ['a number greater than 2', 4, '3, 4, 5 and 6 work'],
          ['a factor of 6', 4, '1, 2, 3 and 6 work'],
        ];
        const [label, count, why] = pick(options);
        return q(
          `A fair dice is rolled once. What is the probability of rolling ${label}?`,
          count / 6,
          `There are ${count} favourable outcomes out of 6 (${why}).`
        );
      }
      const red = rnd(2, 7);
      const blue = rnd(2, 7);
      const green = rnd(1, 5);
      const total = red + blue + green;
      if (tier === 4) {
        return q(
          `A bag has ${red} red, ${blue} blue and ${green} green counters. One is taken at random. What is the probability it is red?`,
          red / total,
          `${red} red out of ${total} counters = ${red}/${total}.`
        );
      }
      return q(
        `A bag has ${red} red, ${blue} blue and ${green} green counters. One is taken at random. What is the probability it is not red?`,
        (total - red) / total,
        `${total} − ${red} = ${total - red} counters are not red, out of ${total}.`
      );
    },
  },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id) || TOPICS[0];

export const generateQuestion = (topicId, tier) => {
  const topic = topicById(topicId);
  const safeTier = Math.min(5, Math.max(1, tier || 1));
  const question = topic.generate(safeTier);
  return { ...question, topic_id: topic.id, topic_name: topic.name, tier: safeTier };
};

export const parseAnswer = (input) => {
  if (input === null || input === undefined) return NaN;
  const cleaned = String(input)
    .trim()
    .replace(/[£$,\s]/g, '')
    .replace(/−/g, '-')
    .replace(/=.*$/, '')
    .replace(/%$/, '');
  if (!cleaned) return NaN;
  const fraction = cleaned.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fraction) {
    const top = Number(fraction[1]);
    const bottom = Number(fraction[2]);
    return bottom === 0 ? NaN : top / bottom;
  }
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export const checkAnswer = (input, question) => {
  const parsed = parseAnswer(input);
  if (!Number.isFinite(parsed)) return false;
  const target = question.answer;
  return Math.abs(parsed - target) <= Math.max(0.01, Math.abs(target) * 0.0005);
};