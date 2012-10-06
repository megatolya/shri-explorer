//пробелы в начале и в конце
function trim (str) { 
	return str.replace(/^\s+|\s+$/g, ""); 
}
//проверка на localStorage
function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
//полный url в домен
//TODO: регулярка
function shortUrl(url){
	url = url.replace('http://','').replace('https://','').replace('ftp://','').replace('//','').replace('#','/').replace('?','/').split('/');
	return url[0];
}

//компонент, отвечающий за данные
function shri(){
	this.version='alpha';
	this.schedule=undefined;
}

//из формата shri в формат json
shri.prototype.import = function(text) {
	console.log('import');
	var arr=text.split('##');
	var countDays=0;
	var schedule=new Array(1);
	for (var i = 0; i <= arr.length - 1; i++) {
		schedule[i]=new Array();
		var arr2=arr[i].split('\n');
		var countStr=0;
		var countLection=0;
		var countIdea=0;
		schedule[i][countLection]=new Object();
		for (var j = 0; j <= arr2.length - 1; j++) {
			var currentStr=trim(arr2[j]);
			if(currentStr!='') {
				//date
				if(countStr==0){
					schedule[i][countLection].date=currentStr;
				}
				//time
				if(countStr==1){
					schedule[i][countLection].time=currentStr;
				}
				//theme
				if(countStr==2){
					schedule[i][countLection].theme=currentStr;
				}
				//lector
				if(countStr==3){
					schedule[i][countLection].lector=new Object();
					var split = currentStr.split('(');
					var linksStr=split[1];	
					linksStr=trim(linksStr.replace(')','').replace(' ',''));
					schedule[i][countLection].lector.name=trim(split[0]);
					schedule[i][countLection].lector.links=linksStr.split(',');
				}
				//idea
				if(countStr>3){
					if(trim(arr2[j]).indexOf('?:')+1){
							if(schedule[i][countLection].idea==undefined)
								schedule[i][countLection].idea=new Array();
							currentStr=trim(currentStr.replace('?:',''));
							schedule[i][countLection].idea[countIdea]=currentStr;
							countIdea++;
						}
				//presentation link
					else{
						schedule[i][countLection].link=currentStr;
						if(schedule[i][countLection].date==undefined)
							schedule[i][countLection].date=schedule[i][countLection-1].date;
						countLection++;
						countIdea=0;
						countStr=0;
						schedule[i][countLection]=new Object();
					}
				}
				countStr++;
			}

		}	
		if(schedule[i][countLection].time==undefined)
				schedule[i].splice(countLection,1)
	}
	
	this.schedule=schedule;

	localStorage.setItem('shri', JSON.stringify(schedule));
	console.log('import done');
}

shri.prototype.buildSchedule=function(){
	console.log('building schedule');
	var schedule=this.schedule;
	var html = new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		html+='<div class="b-day" data-day="'+i+'"><div class="b-day__date">'+schedule[i][0].date+'</div>';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			html+='<div class="b-lesson"><div class="b-lesson__time">'+schedule[i][j].time+
			'</div><div class="b-lesson__name">'+schedule[i][j].theme+'</div></div>';
		}
		html+='<a href="#" class="b-button b-lesson__link">Посмотреть</a></div>';
	}
	$('.b-schedule').html(html);
	console.log('building schedule done');
}

shri.prototype.ini = function() {
	var schedule = localStorage.getItem('shri');
	if(schedule!='' && schedule!=undefined && schedule!='[[]]'){
		this.schedule=$.parseJSON(schedule);
		this.buildSchedule(schedule);
	}else{
		$('.b-schedule').html('<div class="b-schedule__hello"><h1>Добро пожаловать!</h1><p>Загляните в справку или загрузите ваше расписание</p></div>');
	}
};		
			
//из json в .shri			
shri.prototype.export = function() {
	console.log('export');
	var schedule=this.schedule;
	var res=new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		if(i!=0)res+= '#\n';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			res+=schedule[i][j].date+ '\n';
		};
	};
	return res;
};
shri= new shri();

//компонент, отвечающий за интерфейс
function interface(){
	this.dialogVisible=false;
}
interface.prototype.openDialog = function(header,html) {
	this.dialogVisible=true;
	$('.b-dialog-win__content').html(html);
	$('.b-dialog-win__header').html(header);
	$('.b-bg-shadow').show();
	$('.b-dialog-win').show();
	$('body').css('overflow','hidden');
}
interface.prototype.dialogPos = function() {
	var winWidth = $(window).width();
	var dialogWidth = $('.b-dialog-win').width();
	$('.b-dialog-win').css('left',(winWidth-dialogWidth)/2)
}
interface.prototype.closeDialog = function() {
	$('body').css('overflow','auto');
	$('.b-bg-shadow').hide();
	$('.b-dialog-win').hide();
	this.dialogVisible=false;
}
interface.prototype.showDay = function(id) {
	//TODO: currentDay
	var day = shri.schedule[id];
	var html = new String();
	for (var i = 0; i <= day.length - 1; i++) {
		html+='<div class="b-day-lesson"><div class="b-day-lesson__time">'+day[i].time+
		'</div><h1 class="b-day-lesson__theme">'+day[i].theme+'</h1><div class="b-lector">Лектор: '+day[i].lector.name+
		' (';
			var lectorLinks=day[i].lector.links.length-1;
			for (var j = 0; j <= lectorLinks; j++) {
				html+='<a href="'+day[i].lector.links[j]+'" class="b-lector__link">'+shortUrl(day[i].lector.links[j])+'</a>'+(lectorLinks==j ? '':', ');
			}
			html+=')</div><div class="b-headnotes"><h4 class="b-headnotes__header">Тезисы:</h4>';
			for (var j = 0; j <= day[i].idea.length - 1; j++) {
				html+='<div class="b-headnote">'+day[i].idea[j]+'</div>';
			}
			html+='</div><a href="'+day[i].link+'" target="_blank" class="b-button b-day-lesson__keynote">Презентация</a>';
			html+='</div>';
	}
	html+='<div class="b-dialog-win__nav"><a onclick="return false;" class="b-dialog-win__nav_target_prev" href="'+(id-1)+'">←</a>  Ctrl  '+
		   '<a class="b-dialog-win__nav_target_next" href="'+(parseInt(id)+1)+'">→</a></div>';
	interface.openDialog(day[0].date,html);

};
interface=new interface();

$(function(){
	shri.ini();
	interface.dialogPos();
	
	$('.b-toolbar__link_name_import').click(function(){
		var html = '<p>Вставьте содержимое файла .shri и нажмите импорт.</p><textarea class="b-import-textarea"></textarea><button class="b-button b-import-btn">Импорт</button>';
		interface.openDialog('Импорт',html);	
		return false;
	});

	$('.b-bg-shadow').click(function(){
		interface.closeDialog();
		return false;
	});
	$('.b-dialog-win__close-btn').click(function(){
		interface.closeDialog();
		return false;
	});
	$('.b-toolbar__link_name_export').click(function(){
		var html = '<p>Скопируйте содержимое формы в файл .shri. </p><textarea class="b-export-textarea"></textarea>';

		interface.openDialog('Экспорт',html);
		$('.b-export-textarea').val(shri.export()).select();
		return false;
	});
	$('.b-toolbar__link_name_manual').click(function(){
		var html = '<p>Здесь будет справка</p>';
		interface.openDialog('Справочная',html);
		return false;
	});
	$('.b-import-btn').live('click',function(){
		var text=$('.b-import-textarea').val();
		shri.import(text);
		shri.buildSchedule();
		return false;
	});

	$('.b-lesson__link').live('click',function(){
		var id = $(this).parent().data('day');
		interface.showDay(id);
		return false;
	});
	$('.b-dialog-win__nav_target_prev').live('click',function(){
		var id = $(this).attr('href');
		if(id>=0 && id<=shri.schedule.length){
			interface.showDay(id);
		}
		return false;
	});
	$('.b-dialog-win__nav_target_next').live('click',function(){
		var id = $(this).attr('href');
		if(id>=0 && id<shri.schedule.length){
			interface.showDay(id);
		}
		return false;
	});

	$('.b-export-textarea').live('click',function(){
		$(this).select();
		return false;
	});

	shortcut.add("Ctrl+left",function() {
		if(interface.dialogVisible)
			$('.b-dialog-win__nav_target_prev').click();
	});

	shortcut.add("Ctrl+right",function() {
		if(interface.dialogVisible)
			$('.b-dialog-win__nav_target_next').click();
	});


});
$(window).resize(function(){
	interface.dialogPos();
});