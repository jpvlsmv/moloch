(function() {

  'use strict';

  /* mock data ------------------------------- */
  // default session query
  let query = {
    length: 50,   // page length
    start : 0,    // first item index
    facets: 1,    // facets
    sorts : [ [ 'fp', 'asc' ] ],
    fields: [ 'pr', 'tipv61-term', 'tipv62-term', 'fp', 'lp', 'a1', 'p1', 'a2', 'p2', 'pa', 'by', 'no', 'us', 'esrc', 'edst', 'esub', 'efn', 'dnsho', 'tls.alt', 'ircch' ]
  };

  // sample session json
  let sessionsJSON = {
    recordsFiltered : 1,
    recordsTotal    : 50,
    data: [
      {
        pa2     :0,
        p1      :10000,
        no      :'demo',
        pa1     :1,
        p2      :2948,
        pr      :17,
        lp      :0,
        fp      :0,
        a1      :16843009,
        a2      :33686018,
        pa      :1,
        db1     :437,
        db2     :0,
        by      :445,
        by2     :0,
        by1     :445,
        db      :437,
        index   :'sessions-',
        id      :'sessionid',
        expanded:false
      }
    ]
  };

  let fields = {
    'protocols': {
      dbField: 'prot-term',
      exp: 'protocols',
      group: 'general',
      friendlyName: 'Protocols',
      help: 'Protocols set for session',
      type: 'termfield'
    },
    'starttime': {
      dbField: 'fp',
      exp: 'starttime',
      group: 'general',
      friendlyName: 'Start Time',
      help: 'Session Start Time',
      type: 'seconds'
    },
    'stoptime': {
      dbField: 'lp',
      exp: 'stoptime',
      group: 'general',
      friendlyName: 'Stop Time',
      help: 'Session Stop Time',
      type: 'seconds'
    },
    'ip.src': {
      dbField: 'a1',
      exp: 'ip.src',
      type: 'ip',
      category: 'ip',
      group: 'general',
      friendlyName: 'Src IP',
      help: 'Source IP'
    },
    'ip.dst': {
      dbField: 'a2',
      exp: 'ip.dst',
      type: 'ip',
      category: 'ip',
      group: 'general',
      friendlyName: 'Dst IP',
      help: 'Destination IP'
    },
    'port.src': {
      dbField: 'p1',
      exp: 'port.src',
      type: 'integer',
      category: 'port',
      group: 'general',
      friendlyName: 'Src Port',
      help: 'Source Port'
    },
    'port.dst': {
      dbField: 'p2',
      exp: 'port.dst',
      type: 'integer',
      category: 'port',
      group: 'general',
      friendlyName: 'Dst Port',
      help: 'Destination Port'
    },
    'packets': {
      dbField: 'pa',
      exp: 'packets',
      type: 'integer',
      group: 'general',
      friendlyName: 'Packets',
      help: 'Total number of packets sent AND received in a session'
    },
    'bytes': {
      dbField: 'by',
      exp: 'bytes',
      type: 'integer',
      group: 'general',
      friendlyName: 'Bytes',
      help: 'Total number of raw bytes sent AND received in a session'
    },
    'no': {
      dbField: 'no',
      exp: 'node',
      group: 'general',
      friendlyName: 'Moloch Node',
      help: 'Moloch node name the session was recorded on',
      type: 'termfield'
    },
    'info': {
      width: 250,
      dbField: 'info',
      exp: 'info',
      group: 'general',
      friendlyName: 'Info',
      help: 'Information',
      children: ['us', 'esrc', 'edst', 'esub', 'efn', 'dnsho', 'tls.alt', 'ircch']
    },
    'http.uri': { dbField: 'us', exp: 'http.uri' },
    'email.src': { dbField: 'esrc', exp: 'email.src' },
    'email.dst': { dbField: 'edst', exp: 'email.dst' },
    'email.subject': { dbField: 'esub', exp: 'email.subject' },
    'email.fn': { dbField: 'efn', exp: 'email.fn' },
    'host.dns': { dbField: 'dnsho', exp: 'host.dns' },
    'cert.alt': { dbField: 'tls.alt', exp: 'cert.alt' },
    'irc.channel': { dbField: 'ircch', exp: 'irc.channel' }
  };

  describe('Session List Component ->', function() {

    // load the module
    beforeEach(angular.mock.module('moloch'));

    let scope, sessionComponent, sessionService, $httpBackend;
    let sessionsEndpoint    = 'sessions.json';
    let defaultParameters   = '?facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,lp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch&length=50&order=fp:asc';
    let tableStateEndpoint  = 'tableState/sessionsNew';

    // Initialize and a mock scope
    beforeEach(inject(function(
      $timeout,
      $location,
      $routeParams,
      $anchorScroll,
      _$httpBackend_,
      SessionService,
      FieldService,
      $componentController,
      $rootScope) {
        sessionService = SessionService;

        $httpBackend = _$httpBackend_;

        // initial query for table state
        $httpBackend.expectGET(tableStateEndpoint)
           .respond({});

        $httpBackend.expectGET('user/settings')
           .respond({});

        // initial query for fields
        $httpBackend.expectGET('fields')
           .respond(fields);

        // initial query for sessions
        $httpBackend.expectGET(sessionsEndpoint + defaultParameters)
           .respond(sessionsJSON);

        scope = $rootScope.$new();

        sessionComponent = $componentController('session', {
          $scope            : scope,
          $timeout          : $timeout,
          $location         : $location,
          $routeParams      : { openAll:1 },
          $anchorScroll     : $anchorScroll,
          SessionService    : SessionService,
          FieldService      : FieldService
        });

        // spy on functions called in controller
        spyOn(sessionComponent, 'getData').and.callThrough();
        spyOn(sessionComponent, 'getTableState').and.callThrough();
        spyOn(sessionService, 'exportUniqueValues').and.callThrough();
        spyOn(sessionComponent, 'openAll').and.callThrough();
        spyOn(sessionComponent, 'toggleSessionDetail').and.callThrough();

        // initialize session component controller
        sessionComponent.$onInit();
        $httpBackend.flush();
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should exist and have dependencies', function() {
      expect(sessionComponent).toBeDefined();
      expect(sessionComponent.$scope).toBeDefined();
      expect(sessionComponent.$timeout).toBeDefined();
      expect(sessionComponent.$location).toBeDefined();
      expect(sessionComponent.$routeParams).toBeDefined();
      expect(sessionComponent.$anchorScroll).toBeDefined();
      expect(sessionComponent.SessionService).toBeDefined();
      expect(sessionComponent.FieldService).toBeDefined();
    });

    it('should fetch the table data', function() {
      sessionsJSON.data[0].expanded = true;

      expect(sessionComponent.getData).toHaveBeenCalled();
      expect(sessionComponent.getData).toHaveBeenCalledWith();
      expect(sessionComponent.sessions).toEqual(sessionsJSON);
    });

    it('should have smart query defaults', function() {
      expect(sessionComponent.query).toBeDefined();
      expect(sessionComponent.query).toEqual(query);
      expect(sessionComponent.currentPage).toEqual(1);
    });

    it('should fetch the table state', function() {
      expect(sessionComponent.getTableState).toHaveBeenCalled();
      expect(sessionComponent.getTableState.calls.count()).toBe(1);
      expect(sessionComponent.getTableState).toHaveBeenCalledWith();
      expect(sessionComponent.tableState).toBeDefined();
    });

    it('should have smart user settings defaults', function() {
      expect(sessionComponent.settings).toEqual({ timezone: 'local' });
    });

    it('should toggle session detail', function() {
      sessionComponent.toggleSessionDetail(sessionsJSON.data[0]);
      expect(sessionComponent.stickySessions.length).toEqual(0);
      sessionComponent.toggleSessionDetail(sessionsJSON.data[0]);
      expect(sessionComponent.stickySessions.length).toEqual(1);
    });

    it('should accept an openAll parameter', function() {
      sessionsJSON.data[0].expanded = false;

      expect(sessionComponent.$routeParams.openAll).toEqual(1);

      expect(sessionComponent.openAll).toHaveBeenCalled();
      expect(sessionComponent.openAll).toHaveBeenCalledWith();

      expect(sessionComponent.toggleSessionDetail).toHaveBeenCalled();
      expect(sessionComponent.toggleSessionDetail).toHaveBeenCalledWith(sessionsJSON.data[0]);
    });


    describe('table sorting ->', function() {
      afterEach(function() {
        // cleanup table state
        sessionComponent.tableState.order = [['fp', 'asc']];
        sessionComponent.query.sorts      = sessionComponent.tableState.order;
      });

      it('should have smart default sorts', function() {
        expect(sessionComponent.isSorted('fp')).toBeGreaterThan(-1);
        expect(sessionComponent.getSortOrder('fp')).toEqual('asc');
      });

      it('should toggle sort order', function() {
        $httpBackend.expectPOST(tableStateEndpoint)
           .respond(200);

        let newParameters = '?facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,lp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch&length=50&order=fp:desc';
        $httpBackend.expectGET(sessionsEndpoint + newParameters)
           .respond(sessionsJSON);

        sessionComponent.sortBy({},'fp');

        $httpBackend.flush();

        expect(sessionComponent.isSorted('fp')).toBeGreaterThan(-1);
        expect(sessionComponent.getSortOrder('fp')).toEqual('desc');
      });

      it('should change sort order', function() {
        $httpBackend.expectPOST(tableStateEndpoint)
           .respond(200);

        let newParameters = '?facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,lp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch&length=50&order=lp:asc';
        $httpBackend.expectGET(sessionsEndpoint + newParameters)
           .respond(sessionsJSON);

        sessionComponent.sortBy({},'lp');

        $httpBackend.flush();

        expect(sessionComponent.isSorted('lp')).toBeGreaterThan(-1);
        expect(sessionComponent.getSortOrder('lp')).toEqual('asc');
      });

      it('should add sort on shift click', function() {
        $httpBackend.expectPOST(tableStateEndpoint)
           .respond(200);

        let newParameters = '?facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,lp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch&length=50&order=fp:asc,lp:asc';
        $httpBackend.expectGET(sessionsEndpoint + newParameters)
           .respond(sessionsJSON);

        sessionComponent.sortBy({ shiftKey:true },'lp');

        $httpBackend.flush();

        expect(sessionComponent.isSorted('fp')).toBeGreaterThan(-1);
        expect(sessionComponent.getSortOrder('fp')).toEqual('asc');

        expect(sessionComponent.isSorted('lp')).toBeGreaterThan(-1);
        expect(sessionComponent.getSortOrder('lp')).toEqual('asc');
      });
    });


    describe('column visibility ->', function() {
      afterEach(function() {
        // cleanup table state
        sessionComponent.tableState.visibleHeaders = ['fp', 'lp', 'src', 'p1', 'dst', 'p2', 'pa', 'dbby', 'no', 'info'];
      });

      it('should have smart default visible headers', function() {
        let defaultHeaders = ['fp', 'lp', 'src', 'p1', 'dst', 'p2', 'pa', 'dbby', 'no', 'info'];

        expect(sessionComponent.tableState.visibleHeaders).toEqual(defaultHeaders);
      });

      it('should toggle header visibility', function() {
        $httpBackend.expectPOST(tableStateEndpoint)
           .respond(200);

        sessionComponent.toggleVisibility('lp');

        $httpBackend.flush();

        expect(sessionComponent.isVisible('lp')).toEqual(-1);
      });

      it('should issue query when adding a header', function() {
        $httpBackend.expectPOST(tableStateEndpoint)
           .respond(200);

        let newParameters = '?facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch,lp&length=50&order=fp:asc';
        $httpBackend.expectGET(sessionsEndpoint + newParameters)
           .respond(sessionsJSON);

        $httpBackend.expectPOST(tableStateEndpoint)
           .respond(200);

        sessionComponent.toggleVisibility('lp');
        sessionComponent.toggleVisibility('lp');

        $httpBackend.flush();

        expect(sessionComponent.isVisible('lp')).toBeGreaterThan(-1);
      });
    });


    describe('listeners ->', function() {
      let sorts       = [['fp', 'asc']];
      let length      = 200;
      let currentPage = 2;
      let start       = (currentPage - 1) * length;
      let sub_scope;

      beforeEach(function() {
        sub_scope = scope.$new();

        spyOn(scope, '$broadcast').and.callThrough();
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        // cleanup
        sessionComponent.query.date   = null;
        sessionComponent.query.start  = 0;
        sessionComponent.query.length = 50;
      });

      it('should listen for "change:search" event', function() {
        let newParameters = '?date=-1&facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,lp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch&length=50&order=fp:asc';
        $httpBackend.expectGET(sessionsEndpoint + newParameters)
          .respond(sessionsJSON);

        sub_scope.$emit('change:search', {
          start: 0, stop: 0, expression: ''
        });

        sub_scope.$emit('change:search', {
          date: -1, expression: ''
        });

        $httpBackend.flush();

        expect(sessionComponent.getData).toHaveBeenCalled();
        expect(sessionComponent.getData.calls.count()).toBe(2);
        expect(sessionComponent.getData).toHaveBeenCalledWith();
      });

      it('should listen for "change:pagination" event', function() {
        let newParameters = '?facets=1&flatten=1&fields=pr,tipv61-term,tipv62-term,fp,lp,a1,p1,a2,p2,pa,by,no,us,esrc,edst,esub,efn,dnsho,tls.alt,ircch&length=200&order=fp:asc&start=200';
        $httpBackend.expectGET(sessionsEndpoint + newParameters)
           .respond(sessionsJSON);

        sub_scope.$emit('change:pagination',
           { length:length, currentPage:currentPage, start:start }
        );

        $httpBackend.flush();

        expect(sessionComponent.query.length).toEqual(length);
        expect(sessionComponent.query.start).toEqual(start);
        expect(sessionComponent.currentPage).toEqual(currentPage);
        expect(sessionComponent.getData).toHaveBeenCalled();
        expect(sessionComponent.getData).toHaveBeenCalledWith();
      });

      it('should listen for "add:to:search" event', function() {
        let args = { expression:'full == expression' };
        scope.$emit('add:to:search', args);

        expect(scope.$broadcast).toHaveBeenCalled();
        expect(scope.$broadcast).toHaveBeenCalledWith('add:to:typeahead', args);
        expect(scope.$broadcast.calls.count()).toBe(1);
      });

      it('should listen for "change:time" event', function() {
        let args = { start: 0, stop: 0 };
        scope.$emit('change:time', args);

        expect(scope.$broadcast).toHaveBeenCalled();
        expect(scope.$broadcast).toHaveBeenCalledWith('update:time', args);
        expect(scope.$broadcast.calls.count()).toBe(1);
      });

      it('should call SessionService when exporting unique column values', function() {
        sessionComponent.exportUnique('a1', 0);
        expect(sessionService.exportUniqueValues).toHaveBeenCalled();
        expect(sessionService.exportUniqueValues).toHaveBeenCalledWith('a1', 0);

        sessionComponent.exportUnique('a1:p1', 0);
        expect(sessionService.exportUniqueValues).toHaveBeenCalled();
        expect(sessionService.exportUniqueValues).toHaveBeenCalledWith('a1:p1', 0);

        sessionComponent.exportUnique('g2', 1);
        expect(sessionService.exportUniqueValues).toHaveBeenCalled();
        expect(sessionService.exportUniqueValues).toHaveBeenCalledWith('g2', 1);
      });

    });

  });

})();
