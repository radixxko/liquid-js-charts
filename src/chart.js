Chart = function()
{
	var pixelRatio = window.devicePixelRatio;
	
	var charts = [];
	
	var chart_types = 
	{
		pie: require('charts/pie.js')
	}
	
	function viewportPosition( element )
	{
		var position = { x : 0, y : 0 };
		
		if( element.offsetParent )
		{	
			do
			{
				position.x += element.offsetLeft - element.scrollLeft;
				position.y += element.offsetTop - element.scrollTop;	
			}
			while( element = element.offsetParent );
		}
		
		return position;
	}
		
	window[window.attachEvent ? 'attachEvent' : 'addEventListener'](window.attachEvent ? 'onresize' : 'resize', function()
    {
		for( var i = charts.length - 1; i >= 0; --i )
		{
			if( document.contains(charts[i].element) && document.contains(charts[i].canvas) )
			{
				if( charts[i].width != charts[i].element.offsetWidth || charts[i].height != charts[i].element.offsetHeight )
				{
					charts[i].canvas.setAttribute('width', charts[i].element.offsetWidth * pixelRatio);
					charts[i].canvas.setAttribute('height', charts[i].element.offsetHeight * pixelRatio);
					charts[i].canvas.setAttribute('style','position:absolute;top:0;left:0;width:'+charts[i].element.offsetWidth+'px;height:'+charts[i].element.offsetHeight+'px');
					
					charts[i].chart.event('resize');
				}
			}
			else{ charts.splice(i, 1); }
		}    
    });
	
	this.create = function( chart, element, data, options )
	{
		if( typeof element == 'string' ){ element = document.getElementById(element); }
		
		if( element && typeof chart_types[chart] != undefined )
		{
			var canvas = document.createElement('canvas');
			
			canvas.setAttribute('width', element.offsetWidth * pixelRatio);
			canvas.setAttribute('height', element.offsetHeight * pixelRatio);
			canvas.setAttribute('style','position:absolute;top:0;left:0;width:'+element.offsetWidth+'px;height:'+element.offsetHeight+'px');
			
			element.innerHTML = '';
			element.appendChild(canvas);
			
			chart = new chart_types[chart]( canvas, data, options );
			
			canvas.addEventListener('mousemove', function(event)
			{
				var position = viewportPosition( element );
				
				chart.event('mousemove', { x: ( position.x + event.pageX ) * pixelRatio, y: ( position.y + event.pageY ) * pixelRatio });
			});
			
			canvas.addEventListener('mouseout', function(event){ chart.event('mouseout'); });
			
			charts.push({ chart: chart, element: element, canvas: canvas, width: element.offsetWidth, height: element.offsetHeight });
		}
	}
}