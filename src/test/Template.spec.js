define(function(require) {
  var $ = require('jquery')
  var Template = require('../main/Template')

  describe('Common template test', function() {
    it('Plain templates', function() {
      expect(Template.header()).toEqual('<table class="calendarHeader" />')
      expect(Template.body()).toEqual('<table class="calendarBody" />')
      expect(Template.scrollContent()).toEqual('<div class="calendarScrollContent" />')
      expect(Template._tinyScrollbar()).toEqual('<div class="tinyscrollbar"><div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div></div>')
      expect(Template._headerRow()).toEqual('<tr><th class="month" /><th class="week">&nbsp;</th>')
      expect(Template.th()).toEqual('<th>')
      expect(Template.thead()).toEqual('<thead>')
      expect(Template.innerWrapper()).toEqual('<div />')
      expect(Template._lengthLabel()).toEqual('<div class="label"><span class="rangeLengthLabel" /></div>')
      expect(Template._separator()).toEqual('<span class="separator"> - </span>')
      expect(Template._endDateLabel()).toEqual('<span class="endDateLabel" />')
      expect(Template._startDateLabel()).toEqual('<div class="label"><span class="startDateLabel" /></div>')
      expect(Template._clearDates()).toEqual('<span class="clearDates clickable" />')
      expect(Template.clearLabel()).toEqual('<div class="label clearLabel" />')
      expect(Template.popupContainer()).toEqual('<div class="popUpContainer" />')
      expect(Template._calendar()).toEqual('<div class="continuousCalendar" />')
      expect(Template.emptyContainer()).toEqual('<div />')
    })

    it('Templates with variables', function() {
      var data = {
        rows: 'ROWS',
        content: 'CONTENT',
        classNames: 'CLASSNAMES',
        index: 'INDEX'
      }
      expect(Template.tbody(data)).toEqual('<tbody>ROWS</tbody>')
      expect(Template.bodyRow(data)).toEqual('<tr>CONTENT</tr>')
      expect(Template._dateCell(data)).toEqual('<td class="CLASSNAMES" date-cell-index="INDEX">CONTENT</td>')
      expect(Template.weekCell(data)).toEqual('<th class="week CLASSNAMES">CONTENT</th>')
      expect(Template._monthCell(data)).toEqual('<th class="month CLASSNAMES">CONTENT</th>')
      expect(Template.icon(data)).toEqual('<a href="javascirpt:;" class="calendarIcon">CONTENT</a>')
    })
  })
})

