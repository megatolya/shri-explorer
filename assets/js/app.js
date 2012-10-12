/**
*serializes form to object
*
*@this {form}
*@return {object} serialized form object
*/
// TODO reserealize add
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
}
/**
*generates short url from full url
*
*@param {string} url
*@param {string} short url
*/
//TODO: регулярка
function shortUrl(url) {
    url = url.replace('http://', '').replace('https://', '').replace('ftp://', '').replace('//', '').replace('#', '/').replace('?', '/').split('/');
    return url[0];
}

/**
*returns today date 
*
*@return {date} today
*/
function Today() {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}
/**
* returns date of text dd.mm.yyyy
*
*@param {string} text-date
*@return {date} date
*/
function getDateOfTextDate(text) {
    //15.09.2012
    text = $.trim(text);
    var arr = text.split('.');
    var year = parseInt(arr[2]);
    if (arr[1][0] != '0')
        var month = parseInt(arr[1]);
    else
        var month = parseInt(arr[1][1]);
    var day = parseInt(arr[0]);
    return new Date(year, month - 1, day);
}
/**
* returns date of text hh:mm
*
*@param {string} text-time
*@return {date} date
*/
function getDateOfTextTime(text) {
    //13:00
    text = $.trim(text);
    var arr = text.split(':');
    return new Date(0, 0, 0, arr[0], arr[1]);
}

/**
*lection's class
*
*@this {Lection}
*/
function Lection (obj, day) {
    this.date = obj.date;
    this.theme = obj.theme;
    this.link = obj.link;
    this.time = obj.time;
    this.lector = obj.lector;
    this.idea = obj.idea;
    this.day = day;
}
/**
*returns current lection' day
*
*@return {array} day
*/
Lection.prototype.Day = function() {
    return Shri.schedule[this.day];
};
/**
 * Works with data
 *
 * @this {Shri}
 */
function Shri () {
    this.version = 'alpha';
    this.schedule = undefined;
}
//TODO больше проверок :-)
Shri.prototype.isValid = function (forms) {
    var time = /^[0-9]{0,2}[0-9]{1,2}:[0-9]{2}$/;
    var date = /^[0-9]{1,2}.[0-9]{1,2}.20[0-9]{2}$/;
    var specialChars = /##|\?:/;
    var isValid = true;
    $(forms).each(function(id,form){
         var obj = $(form).serializeObject();
         if(!date.test(obj.date)) {
            isValid = false;
            alert('дата пишется в формате дд.мм.гггг');
            return;
         }
         if(!time.test(obj.time)) {
            alert('Время пишется в формате чч:мм');
            isValid = false;
            return;
         }
         $.each(obj, function () {
            if(specialChars.test(this)) {
                alert('## и ?: зарезервированные символы!');
                isValid = false;
                return;
            }

         });

    });
    return isValid;
}
/**
*Sort array by time
*
*@param {object} a
*@param {object} b
*@return {integer}
*/
Shri.prototype.sortByTime = function (a, b) {
    a = getDateOfTextTime(a.time);
    b = getDateOfTextTime(b.time);
    return a.valueOf() - b.valueOf();
}
/**
*Adds lection to day
*
*@param {object} lection
*@param {integer} day id
*/
Shri.prototype.addLectionToDay = function (lection, day) {
    var lecTime = parseInt(lection.time.replace(':', ''));
    var schedule = this.schedule;
    var dayArr = schedule[day];
    lection.date = schedule[day][0].date;
    dayArr.push(lection);
    var newArr = dayArr.sort(this.sortByTime);
    this.schedule[day] = newArr;
    localStorage.setItem('Shri', JSON.stringify(this.schedule));
}
/**
*deletes day
*
*@param {integer} day id
*/
Shri.prototype.deleteDay = function (id) {
    this.schedule.split(id, this.schedule);
    localStorage.setItem('Shri', JSON.stringify(this.schedule));
};
/**
*deletes lection by id of lection and day
*
*@param {integer} day id
*@param {integer} lection id
*/
Shri.prototype.deleteLectionFromDay = function (day, lection) {
    console.log(this.schedule[day]);
    var dayArr = this.schedule[day];
    if (dayArr.length == 1) {
        this.schedule.splice(day, 1);
    } else {
        this.schedule[day].splice(lection, 1);
    }
    localStorage.setItem('Shri', JSON.stringify(this.schedule));
    //TODO localstorage
    //TODO func localStorage.setItem('shri', JSON.stringify(this.schedule));
}
/**
*returns number of today day if exists or false
*
*@return {integer} id of day
*/
Shri.prototype.today = function () {
    var today = Today().valueOf();
    var schedule = this.schedule;
    var todayId = 0;
    $(schedule).each(function (dayId, day) {
        $(day).each(function (lectionId, lection) {
            if (getDateOfTextDate(lection.date).valueOf() == today) {
                todayId = dayId;
            }
        });
    });
    return todayId;
}
/**
*imports text with shri format to app data
*
*@param {string} text with shri format
*/
Shri.prototype.import = function (text) {
    var arr = text.split('##');
    var countDays = 0;
    var schedule = new Array();
    $(arr).each(function (dayId, day) {
        schedule[dayId] = new Array();
        var strings = day.split('\n');
        var countStr = 0;
        var countLection = 0;
        var countIdea = 0;
        schedule[dayId][countLection] = new Object();
        $(strings).each(function (line, string) {
            var currentStr = $.trim(string);
            if (currentStr != '') {
                //TODO Switch
                //date
                if (countStr == 0) {
                    schedule[dayId][countLection].date = currentStr;
                    schedule[dayId][countLection].day = dayId;
                }
                //time
                if (countStr == 1) {
                    schedule[dayId][countLection].time = currentStr;
                }
                //theme
                if (countStr == 2) {
                    schedule[dayId][countLection].theme = currentStr;
                }
                //lector
                if (countStr == 3) {
                    schedule[dayId][countLection].lector = new Object();
                    var split = currentStr.split('(');
                    var linksStr = split[1];
                    linksStr = $.trim(linksStr.replace(')', '').replace(' ', ''));
                    schedule[dayId][countLection].lector.name = $.trim(split[0]);
                    schedule[dayId][countLection].lector.links = linksStr.split(',');
                }
                //idea
                if (countStr > 3) {
                    if ($.trim(string).indexOf('?:') + 1) {
                        if (schedule[dayId][countLection].idea == undefined)
                            schedule[dayId][countLection].idea = new Array();
                        currentStr = $.trim(currentStr.replace('?:', ''));
                        schedule[dayId][countLection].idea[countIdea] = currentStr;
                        countIdea++;
                    }
                    //presentation link
                    else {
                        schedule[dayId][countLection].link = currentStr;
                        if (schedule[dayId][countLection].date == undefined)
                            schedule[dayId][countLection].date = schedule[dayId][countLection - 1].date;
                        countLection++;
                        countIdea = 0;
                        countStr = 0;
                        schedule[dayId][countLection] = new Object();
                    }
                }
                countStr++;
            }

        });
        if (schedule[dayId][countLection].time == undefined)
            schedule[dayId].splice(countLection, 1)
    });
    var newSchedule=new Array();
    $(schedule).each(function (dayId,day) {
        arr = $.map(day, function (lection){
            return new Lection(lection, dayId);
        });
        newSchedule[dayId]=arr;
    });
    this.schedule = newSchedule;
    localStorage.setItem('Shri', JSON.stringify(newSchedule));
}
//TODO поменять все парентс на data-id, data-id поменять на data-day
/**
*builds html of lections from app's data
*/
Shri.prototype.buildSchedule = function () {
    var schedule = this.schedule;
    var html = new String();
    $(schedule).each(function (dayId, day) {
        html += '<div class="b-day" data-day="' + dayId + '"><img class="b-day__edit" alt="редактировать" src="assets/img/pencil.png"><div class="b-day__date">' + day[0].date + '</div>';
        $(day).each(function (lectionId, lection) {
            html += '<div class="b-lesson"><div data-day="' + dayId + '" data-lection="' + lectionId + '" class="b-lesson__time">' + lection.time +
                '</div><div class="b-lesson__name">' + lection.theme + ' - <i>' + lection.lector.name + '</i></div></div>';
        });
        html += '<a href="#" class="b-button b-lesson__link" data-id="' + dayId + '">Посмотреть</a></div>';
    });
    $('.b-schedule').html(html);
    $('.b-lesson__time').draggable({
        revert:"invalid"
    });

    $('.b-day').droppable({
        accept:".b-lesson__time",
        activeClass:"b-droppable",
        drop:function (event, ui) {
            var date = $(this).find('.b-day__date').html();
            if (date != Shri.schedule[$(ui.draggable).data('day')][0].date) {
                if (Shri.changeLectionDay($(ui.draggable).data('day'), $(ui.draggable).data('lection'), date)) {
                    Shri.buildSchedule();
                }
            } else {
                $(ui.draggable).css('left', 'auto').css('top', 'auto');
            }
        }
    });
}
/**
*returns day id or false if not exist
//todo map
*@param {string} date
*@return {integer} id of day or false
*/
Shri.prototype.getDayByDate = function (date) {
    dayByDate = false;
    $(this.schedule).each(function (dayId, day){
        if (day[0].date == date)
            dayByDate = dayId;
    });
    alert(dayByDate);
    return dayByDate;
}
/**
*changes day of lection
*
*@param {integer} day id
*@param {integer} lection id
*@param {string} new date
*@return {boolean} smth changed or not
*/
//TODO dayId lectionId
Shri.prototype.changeLectionDay = function (oldDayId, oldLectionId, date) {

    var schedule = this.schedule;
    //если переносят в тот же день
    if (schedule[oldDayId][oldLectionId].date == date)
        return false;
    //ищем существующий день
    var found = false;
    $(schedule).each(function (dayId, day) {
        $(day).each(function (lectionId, lection) {
            if(!found){
                if (lection.date == date) {
                    Shri.addLectionToDay(schedule[oldDayId][oldLectionId], dayId);
                    Shri.deleteLectionFromDay(oldDayId, oldLectionId);
                    found = true;
                    return;
                }
            }
        });
    });
    if(found)
        return found;
    //не нашли
    this.schedule.push([schedule[oldDayId][oldLectionId]]);
    this.schedule[this.schedule.length - 1][0].date = date;
    this.deleteLectionFromDay(oldDayId, oldLectionId);
    this.schedule.sort(function (a, b) {
        a = getDateOfTextDate(a[0].date);
        b = getDateOfTextDate(b[0].date);

        return parseInt(a.valueOf()) - parseInt(b.valueOf());
    });
    localStorage.setItem('Shri', JSON.stringify(this.schedule));
    return true;
};
/**
*generates lection data model from form object
*
*@param {object} form obj
*@return {object} lection obj
*/
Shri.prototype.reserialize = function (obj, day) {
    obj.lector = new Object;
    obj.lector.name = obj['lector.name'];
    obj.lector.links = obj['lector.links'];
    if (typeof(obj.lector.links) == 'string')
        obj.lector.links = new Array(obj.lector.links);
    if (typeof(obj.idea) == 'string')
        obj.idea = new Array(obj.idea);
    delete obj['lector.links'];
    delete obj['lector.name'];
    obj = new Lection(obj, day);
    return obj;
}
/**
*adds to schedule editted day
*
*@param {integer} id of day
*@param {array} day arr
*/
Shri.prototype.saveDay = function (id, arr) {
    if (arr.length > 0) {
        this.schedule[id] = arr;
        localStorage.setItem('Shri', JSON.stringify(this.schedule));
    } else {
        this.deleteDay(id);
    }
    Shri.buildSchedule();
}
/**
*initialize localstorage and calls Shri.today method
*/
Shri.prototype.ini = function () {
    var schedule = localStorage.getItem('Shri');
    if (schedule != '' && schedule != undefined && schedule != '[[]]' && schedule != '[]') {
        schedule = $.parseJSON(schedule);
        var newSchedule = new Array;
        $(schedule).each(function (dayId, day) {
            newSchedule[dayId] = $.map(day, function (lection) {
                return new Lection(lection, dayId);
            });
            
        });
        this.schedule = newSchedule;

        if (this.today()===false) {
            $('.b-toolbar__link_name_today').removeClass('b-toolbar__link_name_today').addClass('b-link-disabled')
        }
        this.buildSchedule(schedule);
    } else {
        $('.b-schedule').html('<div class="b-day"><h1 class="b-hello-header">Добро пожаловать :-)</h1><p class="b-hello-text">Загляните в справку или загрузите ваше расписание.</p></div>');
    }

};
/**
*takes app's schedule and make shri format from it
*
*@return {string} shri formatted text
*/        
Shri.prototype.export = function () {
    var schedule = this.schedule;
    var res = new String();
    var days = schedule.length - 1;
    $(schedule).each(function (dayId, day) {
        $(day).each(function (lectionId, lection) {
            res += lection.date + '\n';
            res += lection.time + '\n';
            res += lection.theme + '\n';
            res += lection.lector.name + ' (';
            var lectorLinks = lection.lector.links.length - 1;
            $(lection.lector.links).each(function (linkId, link) {
                res += link
                if (linkId != lectorLinks)
                    res += ', ';
            });
            res += ')\n';
            $(lection.idea).each(function (ideaId, idea) {
                res += '?: ' + idea + '\n';
            });            ;
            res += lection.link;
        });
        if (dayId != days)
            res += '\n##\n';
    });
    return res;
};
Shri = new Shri();

/**
*works with interface of app
*
*@this {Interface}
*/
function Interface() {
    this.dialogVisible = false;
    this.datepickerOpened = false;
    this.datepickerOpenedByDrag = false;
}
/**
*puts html to dialog html and shows it
*
*@param {string} header html
*@param {string} content html
*@param {string} footer html
*/
Interface.prototype.openDialog = function (header, html, footer) {
    this.dialogVisible = true;
    $('.b-dialog-win__content').html(html);
    $('.b-dialog-win__header').html(header);
    $('.b-dialog-win__footer').html((footer == undefined ? '' : footer));
    $('.b-bg-shadow').show();
    $('.b-dialog-win').show();
    $('body').css('overflow', 'hidden');
}
/**
*controls position of dialog window
*/
Interface.prototype.dialogPos = function () {
    var winWidth = $(window).width();
    var winHeight = $(window).height();
    var dialogWidth = $('.b-dialog-win').width();
    $('.b-dialog-win').css('left', (winWidth - dialogWidth) / 2);
    $('.b-dialog-win__content').css('max-height', winHeight - 220 + 'px');
}
/**
*closes dialog window
*/
Interface.prototype.closeDialog = function () {
    $('body').css('overflow', 'auto');
    $('.b-bg-shadow').hide();
    $('.b-dialog-win').hide();
    this.dialogVisible = false;
}
/**
*generates form for adding new lection
*
*/
Interface.prototype.newLesson = function () {
    var html = '';
}
/**
*generates form for editting day
*
*@param {integer} id of day
*/
Interface.prototype.editDay = function (id) {
    //TODO: currentDay
    var day = Shri.schedule[id];
    var html = new String();
    var date = day[0].date;
    for (var i = 0; i <= day.length - 1; i++) {
        html += '<form class="b-edit-lesson" data-id="' + i + '">' +
            '<input type="hidden" name="date" value="' + date + '">' +
            '<table class="i-edit-lesson">' +

            '<tr><td>Время</td><td><input class="b-edit-lesson__input b-edit-lesson__input_name_time" name="time" value="' + day[i].time + '"></td></tr>' +
            '<tr><td colspan="3">Тема</td></tr>' +
            '<tr><td colspan="3"><input class="b-edit-lesson__input" name="theme" value="' + day[i].theme + '"></td></tr>' +
            '<tr><td colspan="3">Тезисы <a href="#" class="b-edit-lesson__add-idea">+</a></td></tr>';

        for (var j = 0; j <= day[i].idea.length - 1; j++) {
            html += '<tr><td colspan="2"><input class="b-edit-lesson__input" name="idea" value="' + day[i].idea[j] + '"></td><td><a href="#" class="b-edit-lesson__delete-idea">x</a></td></tr>';
        }
        html += '<tr><td colspan="3">Лектор</td></tr>' +
            '<tr><td colspan="3"><input class="b-edit-lesson__input" name="lector.name" value="' + day[i].lector.name + '"></td></tr>' +
            '<tr><td colspan="3">Ссылки на лектора <a href="#" class="b-edit-lesson__add-link">+</a></td></tr>';
        for (var j = 0; j <= day[i].lector.links.length - 1; j++) {
            html += '<tr><td colspan="2"><input class="b-edit-lesson__input" name="lector.links" value="' + day[i].lector.links[j] + '"></td><td><a href="#" class="b-edit-lesson__delete-link">x</a></td></tr>';
        }
        ;
        html += '<tr><td colspan="3">Презентация</td></tr>' +
            '<tr><td colspan="3"><input class="b-edit-lesson__input" name="link" value="' + day[i].link + '"></td></tr>' +
            '</table></form>';
    }
    var footer = '<a href="#" class="b-save-day" data-id="' + id + '">Сохранить</a> ' +
        '<a href="#" class="b-lesson__link" data-id="' + id + '">Показать день</a> ' +
        '<a href="#" class="b-save-day-quit">Выйти</a>';
    this.openDialog(date, html, footer);

}
/**
*shows day by id
*
*@param {integer} id of day
*/
Interface.prototype.showDay = function (id) {
    var day = Shri.schedule[id];
    var html = new String();
    $(day).each(function (lectionId, lection) {
        html += '<div class="b-day-lesson"><div class="b-day-lesson__time">' + lection.time +
            '</div><h1 class="b-day-lesson__theme">' + lection.theme + '</h1><div class="b-lector">Лектор: ' + lection.lector.name +
            ' (';
        var lectorLinks = lection.lector.links.length - 1;
        $(lection.lector.links).each(function (linkId, link) {
            html += '<a href="' + link + '" class="b-lector__link">' + shortUrl(link) + '</a>' + (lectorLinks == linkId ? '' : ', ');
        });
        html += ')</div><div class="b-headnotes"><h4 class="b-headnotes__header">Тезисы:</h4>';
        $(lection.idea).each(function (ideaId, idea) {
            html += '<div class="b-headnote">' + idea + '</div>';
        });
        html += '</div><a href="' + lection.link + '" target="_blank" class="b-button b-day-lesson__keynote">Презентация</a>';
        html += '</div>';
    });
    html += '<div class="b-dialog-win__nav"><a onclick="return false;" class="b-dialog-win__nav_target_prev" href="' + (id - 1) + '">←</a>  Ctrl  ' +
        '<a class="b-dialog-win__nav_target_next" href="' + (parseInt(id) + 1) + '">→</a> <a class="b-dialog-win__nav_target_edit" href="' + (parseInt(id)) + '">Изменить</a></div>';
    Interface.openDialog(day[0].date, html);
}
/**
*date picker toggle 
*
*@param {number} time for animation
*/
Interface.prototype.datepickerToggle = function (time) {
    if (time == undefined)
        time = 0;
    if (this.datepickerOpened) {
        this.datepickerClose(time);
    } else {
        this.datepickerOpen(time);
    }
}
/**
*closes datepicker
*
*@param {number} time for animation
*/
Interface.prototype.datepickerClose = function (time) {
    if (time == undefined)
        time = 0;
    $('.b-datepicker-toggle').animate({
        left:'-315px'
    }, time, function () {
        $('.b-datepicker-toggle__nav-button').attr('src', 'assets/img/right_arrow.png');
        Interface.datepickerOpened = false;
    });
}
/**
*opens datepicker
*
*@param {number} time for animation
*/
Interface.prototype.datepickerOpen = function (time) {
    if (time == undefined)
        time = 0;
    $('.b-datepicker-toggle').animate({
        left:0
    }, time, function () {
        $('.b-datepicker-toggle__nav-button').attr('src', 'assets/img/left_arrow.png');
        Interface.datepickerOpened = true;
    });
}
/**
*make datepicker droppable
*/
Interface.prototype.droppableDatepicker = function () {
    setTimeout(function () {
        $('.ui-state-default').droppable({
            accept:".b-lesson__time",
            activeClass:"b-droppable",
            drop:function (event, ui) {
                var month = $(this).parent().data('month') + 1;
                if (month < 10)
                    month = '0' + month;
                var date = $(this).html() + '.' + month + '.' + $(this).parent().data('year');
                if (Shri.changeLectionDay($(ui.draggable).data('day'), $(ui.draggable).data('lection'), date)) {
                    Shri.buildSchedule();
                } else {
                    $(ui.draggable).css('left', 'auto').css('top', 'auto');
                }
            }
        });
    }, 100);
};

Interface = new Interface();

$(function () {
    $(document).mouseup(function () {
        if (Interface.datepickerOpenedByDrag)
            setTimeout(function () {
                Interface.datepickerClose(200);
                Interface.datepickerOpenedByDrag = false;
            }, 500);
    });

    $.datepicker.setDefaults($.datepicker.regional['ru']);
    $('.b-datepicker').datepicker({
        onChangeMonthYear:Interface.droppableDatepicker
    });
    Interface.droppableDatepicker();
    Shri.ini();
    Interface.dialogPos();
    var $schedule = $('.b-schedule');
    var $toolbar = $('.b-toolbar');
    var $dialogWin = $('.b-dialog-win');
    var $datepickerToggle = $('.b-datepicker-toggle');
    $schedule
        .on('mousedown', '.b-lesson__time',function(){
            if (Interface.datepickerOpened)
                Interface.datepickerOpenedByDrag = false;
            else
                Interface.datepickerOpenedByDrag = true;
            Interface.datepickerOpen(200);
            })
        .on('click', '.b-day__edit',function () {
            Interface.editDay($(this).parent().data('day'));
            return false;
        })
        .on('click', '.b-lesson__link', function () {
            var id = $(this).data('id');
            Interface.showDay(id);
            return false;
        });
        
   
    $toolbar
        .on('click', '.b-toolbar__link_name_export', function() {
            var html = '<p>Скопируйте содержимое формы в файл .shri. </p><textarea class="b-export-textarea"></textarea>';
            Interface.openDialog('Экспорт', html);
            $('.b-export-textarea').val(Shri.export()).select();
            return false;
        })
        .on('click', '.b-toolbar__link_name_manual', function () {
            var html = '<p>Здесь будет справка</p>';
            Interface.openDialog('Справочная', html);
            return false;
           })
           .on('click', '.b-toolbar__link_name_import', function() {
            var html = '<p>Вставьте содержимое файла .shri и нажмите импорт.</p><textarea class="b-import-textarea"></textarea><button class="b-button b-import-btn">Импорт</button>';
            Interface.openDialog('Импорт', html);
            return false;
           })
           .on('click', '.b-toolbar__link_name_new-lesson', function() {
               Interface.newLesson();
           })
        .on('click', '.b-toolbar__link_name_today',function(){
            Interface.showDay(Shri.today());
            return false;
        });

    $dialogWin
        .on('click', '.b-import-btn', function () {
            var text = $('.b-import-textarea').val();
            Shri.import(text);
            Shri.buildSchedule();
            Interface.closeDialog();
            return false;
        })
        .on('click', '.b-save-day-quit', function () {
            Interface.closeDialog();
            return false;
           })
           .on('click', '.b-dialog-win__nav_target_prev', function () {
            var id = $(this).attr('href');
            if (id >= 0 && id <= Shri.schedule.length)
                Interface.showDay(id);
            return false;
        })
        .on('click', '.b-dialog-win__nav_target_next', function () {
            var id = $(this).attr('href');
            if (id >= 0 && id < Shri.schedule.length)
                Interface.showDay(id);
            return false;
           })
           .on('click', '.b-dialog-win__nav_target_edit' ,function () {
            var id = $(this).attr('href');
            Interface.editDay(id);
            return false;
           })
           .on('click', '.b-save-day', function () {
            var arr = new Array();
            var day = $(this).data('id');

            if(Shri.isValid($('.b-edit-lesson'))){
                $('.b-edit-lesson').each(function (k, form) {
                    var dataModel = Shri.reserialize($(form).serializeObject(),day);
                    arr.push(dataModel);

                });
                arr.sort(Shri.sortByTime);
                Shri.saveDay(day, arr);
            }
            
        })
        .on('click', '.b-dialog-win__close-btn' , function () {
            Interface.closeDialog();
            return false;
        })
           .on('click', '.b-edit-lesson__delete-idea', function () {
            var $this = $(this);
            if ($this.parents('.i-edit-lesson').find('.b-edit-lesson__delete-idea').length > 1)
                $this.parents('tr').remove();
        })
        .on('click', '.b-edit-lesson__delete-link', function () {
            var $this = $(this);
            if ($this.parents('.i-edit-lesson').find('.b-edit-lesson__delete-link').length > 1)
                $this.parents('tr').remove();
        })
        .on('click', '.b-edit-lesson__add-idea', function () {
            $(this).parents('tr').after('<tr><td colspan="2">'+
                '<input class="b-edit-lesson__input" name="idea"></td>'+
                '<td><a href="#" class="b-edit-lesson__delete-idea">x</a></td></tr>');
            return false;
        })
          .on('click', '.b-edit-lesson__add-link', function () {
            $(this).parents('tr').after('<tr><td colspan="2">'+
                '<input class="b-edit-lesson__input" name="lector.links"></td><td>'+
                '<a href="#" class="b-edit-lesson__delete-link">x</a></td></tr>');
            return false;
        })
        .on('click', '.b-lesson__link', function () {
            var id = $(this).data('id');
            Interface.showDay(id);
            return false;
        });

    $datepickerToggle
        .on('click', '.ui-state-default', function () {
            $this = $(this);
            var date = $this.html() + '.' + ($this.parent().data('month') + 1) + '.' + $this.parent().data('year');
            var id = Shri.getDayByDate(date);
            if (id)
                Interface.showDay(id);
            return false;
        })
        .on('click', '.b-datepicker-toggle__nav-button', function () {
            Interface.datepickerToggle(200);
        })

    $('.ui-state-default').live('click', function () {alert()});
    //TODO on
    $('.b-link-disabled').click(function () {
        alert();
        return false;
    });

    $('.b-bg-shadow').click(function () {
        Interface.closeDialog();
        return false;
    });

    shortcut.add("Ctrl+left", function () {
        if (Interface.dialogVisible)
            $('.b-dialog-win__nav_target_prev').click();
    });

    shortcut.add("Ctrl+right", function () {
        if (Interface.dialogVisible)
            $('.b-dialog-win__nav_target_next').click();
    });
});
$(window).resize(function () {
    Interface.dialogPos();
});
/* TODO function today rename*/
//todo today lagaet + dynamic
// TODO input type=text
