# Javascript/CSS Compressor Makefile - Originally by Benjamin "balupton" Lupton (MIT Licenced)
# Adapted for the deniz project by Christoph Burgmer to include cssembed

MAKEFLAGS = --no-print-directory --always-make
MAKE = make $(MAKEFLAGS)

BUILDDIR = ./.build

CLOSUREURL = http://closure-compiler.googlecode.com/files/compiler-latest.zip
CLOSUREDIR = $(BUILDDIR)/closure
CLOSUREFILE = $(CLOSUREDIR)/compiler.jar
YUIURL = http://yui.zenfs.com/releases/yuicompressor/yuicompressor-2.4.6.zip
YUIDIR = $(BUILDDIR)/yui
YUIFILE = $(YUIDIR)/yuicompressor-2.4.6/build/yuicompressor-2.4.6.jar
CSSEMBEDURL = https://github.com/downloads/nzakas/cssembed/cssembed-0.3.6.jar
CSSEMBEDDIR = $(BUILDDIR)/cssembed
CSSEMBEDFILE = $(CSSEMBEDDIR)/cssembed-0.3.6.jar

all:
	$(MAKE) build;

compress:
	java -jar $(CLOSUREFILE) --js_output_file=$(BUILDDIR)/deniz.js --js=./deniz.js;
	java -jar $(CSSEMBEDFILE) ./deniz.css -o $(BUILDDIR)/deniz_datauri.css
	java -jar $(YUIFILE) $(BUILDDIR)/deniz_datauri.css -o $(BUILDDIR)/deniz.css

	for libfile in codemirror.js sparql.js jquery.ba-hashchange.js jquery.cookie.js jquery.js jquery-ui.js ; do \
		java -jar $(CLOSUREFILE) --js_output_file=$(BUILDDIR)/lib/$$libfile --js=./lib/$$libfile ; \
	done
	for libfile in codemirror.css codemirror-default.css ; do \
		java -jar $(YUIFILE) ./lib/$$libfile -o $(BUILDDIR)/lib/$$libfile ; \
	done

	java -jar $(CSSEMBEDFILE) --skip-missing ./lib/jquery-ui.css -o $(BUILDDIR)/jquery-ui_datauri.css
	java -jar $(YUIFILE) $(BUILDDIR)/jquery-ui_datauri.css -o $(BUILDDIR)/lib/jquery-ui.css

	cd $(BUILDDIR) && python ../embed_media.py ../deniz.html > deniz.html
	echo "Successfully build app into $(BUILDDIR)/deniz.html"

build:
	mkdir -p $(BUILDDIR)/lib
	$(MAKE) compress;
	
build-update:
	$(MAKE) clean;
	mkdir $(BUILDDIR) $(CLOSUREDIR) $(YUIDIR) $(CSSEMBEDDIR);
	cd $(CLOSUREDIR); wget -q $(CLOSUREURL) -O file.zip; unzip file.zip;
	cd $(YUIDIR); wget -q $(YUIURL) -O file.zip; unzip file.zip;
	cd $(CSSEMBEDDIR); wget -q $(CSSEMBEDURL);
	
clean:
	find $(BUILDDIR) -maxdepth 1 -type f -exec rm -f "{}" \;
	rm -Rf $(BUILDDIR)/lib

fullclean:
	rm -Rf $(BUILDDIR);
