import logging
from threading import Thread
from BaseHTTPServer import HTTPServer
from SocketServer import ThreadingMixIn
from sparqlprotocolproxy import SPARQLProtocolProxy, options

class TestEndpoint(Thread):
    def __init__(self, host='localhost', port=9980, *args, **kwargs):
        options.cors = True
        self.host = host
        self.port = port
        self.httpd = HTTPServer((self.host, self.port),
                                SPARQLProtocolProxy)
        logging.info("Starting up on %s:%d" % (self.host, self.port))

        Thread.__init__(self, *args, **kwargs)

    def run(self):
        self.httpd.serve_forever()

    def stop(self):
        self.httpd.shutdown()
