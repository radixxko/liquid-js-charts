const SRC = 'src/', DIST = 'dist/', main = 'chart.js';

const fs = require('fs');

function build( source )
{
	var requireRE = /require\(\s*["']([^"']+)["']\s*\)\s*[;]{0,1}/gi,
		requireMatch;
	
	while( requireMatch = requireRE.exec(source) )
	{
		var prefix = '', lineStart = source.lastIndexOf('\n', requireRE.lastIndex-1);
		
		while( lineStart != -1 && ++lineStart < source.length && '\t '.indexOf(source[lineStart]) > -1 ){ prefix += source[lineStart]; }
		
		var module = fs.readFileSync(SRC + requireMatch[1], 'utf8').replace(/^module\.exports\s*=\s*/,'').replace(/[\r\t ]*\n/mg, '\n'+prefix).trim();
		
		source = source.substr(0, requireRE.lastIndex - requireMatch[0].length ) + module + source.substr(requireRE.lastIndex);
		
		requireRE.lastIndex -= requireMatch[0].length;
	}
	
	return source;
}

try
{
	fs.writeFileSync(DIST + main, build(fs.readFileSync(SRC + main, 'utf8')), 'utf8');
	
	console.log('Build "'+main+'" successful!');
}
catch(e)
{
	console.log('Build FAILED!', e);
}