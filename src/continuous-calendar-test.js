module("Charge from customer selector", {
  setup: resetAll,
  tearDown: resetAll
});

test("lists week days for 18.4.2009", function() {
  $("#continuousCalendar").continuousCalendar(18, 4, 2009);
  equals($("#continuousCalendar").html(), [
    "<table>",
    "<tbody>",
    "<tr>",
    "<td>13</td>",
    "<td>14</td>",
    "<td>15</td>",
    "<td>16</td>",
    "<td>17</td>",
    "<td>18</td>",
    "<td>19</td>",
    "</tr>",
    "</tbody>",
    "</table>"
  ].join("\n"));
});

function resetAll() {}