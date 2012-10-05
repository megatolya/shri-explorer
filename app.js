function trim (str) { 
	return str.replace(/^\s+|\s+$/g, ""); 
}
function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function Shri(){
	this.version='alpha';
	this.schedule=undefined;
}

Shri.prototype.import = function(text) {
	console.log('import');
	var arr=text.split('#');
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
				if(countStr==0){
					schedule[i][countLection].date=currentStr;
				}
				if(countStr==1){
					schedule[i][countLection].time=currentStr;
				}
				if(countStr==2){
					schedule[i][countLection].theme=currentStr;
				}
				if(countStr==3){
					schedule[i][countLection].lector=currentStr;
				}
				if(countStr>3){
					if(trim(arr2[j]).indexOf('?:')+1){
							if(schedule[i][countLection].idea==undefined)
								schedule[i][countLection].idea=new Array();
							schedule[i][countLection].idea[countIdea]=currentStr;
							countIdea++;
						}
					else{
						schedule[i][countLection].link=currentStr;
						if(schedule[i][countLection].date==undefined)
							schedule[i][countLection].date=schedule[i][countLection-1].date;
						countLection++;
						countIdea=0;
						countStr=0;
						console.log(j);
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
};

Shri.prototype.build=function(schedule){
	for (var i = 0; i <= schedule.length - 1; i++) {
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			$('body').append('<br>' + schedule[i][j].date);
		}
	}
}
Shri.prototype.export = function(selector) {
	console.log('export');
	var schedule=localStorage.getItem('shri');
	schedule=$.parseJSON(schedule);
	var res=new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		if(i!=0)res+= '#\n';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			res+=schedule[i][j].date+ '\n';
		};
	};
	return res;
};
/*localStorage.setItem('foo', JSON.stringify(foo));
var fooFromLS = JSON.parse(localStorage.getItem('foo'));
console.log(fooFromLS);*/
Shri= new Shri();
$(function(){

		$('#import').click(function(){
			var text = $('.json-import').val();
			Shri.import(text);
			Shri.build(Shri.schedule);
		});

		$('#export').click(function(){
			
			$('.json-export').val(Shri.export());
		});
});