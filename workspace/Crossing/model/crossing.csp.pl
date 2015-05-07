:- dynamic parserVersionNum/1, parserVersionStr/1, parseResult/5.
:- dynamic module/4.
'parserVersionStr'('0.6.0.1').
'parseResult'('ok','',0,0,0).
:- dynamic channel/2, bindval/3, agent/3.
:- dynamic agent_curry/3, symbol/4.
:- dynamic dataTypeDef/2, subTypeDef/2, nameType/2.
:- dynamic cspTransparent/1.
:- dynamic cspPrint/1.
:- dynamic pragma/1.
:- dynamic comment/2.
:- dynamic assertBool/1, assertRef/5, assertTauPrio/6.
:- dynamic assertModelCheckExt/4, assertModelCheck/3.
'parserVersionNum'([0,10,0,1]).
'parserVersionStr'('CSPM-Frontent-0.10.0.1').
'channel'('tock','type'('dotUnitType')).
'dataTypeDef'('GateControl',['constructor'('go_down'),'constructor'('go_up'),'constructor'('up'),'constructor'('down')]).
'channel'('gate','type'('dotTupleType'(['GateControl']))).
'channel'('error','type'('dotUnitType')).
'bindval'('Segments','int'(5),'src_span'(49,1,49,13,1718,12)).
'bindval'('LastSeg','-'('val_of'('Segments','src_span'(50,11,50,19,1793,8)),'int'(1)),'src_span'(50,1,50,23,1783,22)).
'bindval'('TRACKS','setExp'('rangeClosed'('int'(0),'val_of'('LastSeg','src_span'(51,14,51,21,1819,7)))),'src_span'(51,1,51,22,1806,21)).
'bindval'('REALTRACKS','setExp'('rangeClosed'('int'(1),'val_of'('LastSeg','src_span'(52,18,52,25,1845,7)))),'src_span'(52,1,52,26,1828,25)).
'bindval'('GateSeg','int'(3),'src_span'(57,1,57,10,1984,9)).
'dataTypeDef'('TRAINS',['constructor'('Train1'),'constructor'('Train2')]).
'channel'('enter','type'('dotTupleType'(['val_of'('TRACKS','src_span'(65,24,65,30,2129,6)),'TRAINS']))).
'channel'('leave','type'('dotTupleType'(['val_of'('TRACKS','src_span'(65,24,65,30,2129,6)),'TRAINS']))).
'dataTypeDef'('sensed',['constructor'('in'),'constructor'('out')]).
'channel'('sensor','type'('dotTupleType'(['sensed']))).
'agent'('Train'(_A,_j),'prefix'('src_span'(79,15,79,39,2535,24),[],'dotTuple'(['enter','%'('+'(_j,'int'(1)),'val_of'('Segments','src_span'(79,28,79,36,2548,8))),_A]),'prefix'('src_span'(79,43,79,52,2563,9),[],'dotTuple'(['leave',_j,_A]),'agent_call'('src_span'(79,56,79,61,2576,5),'Train',[_A,'%'('+'(_j,'int'(1)),'val_of'('Segments','src_span'(79,70,79,78,2590,8)))]),'src_span'(79,53,79,55,2572,36)),'src_span'(79,40,79,42,2559,64)),'src_span'(79,15,79,79,2535,64)).
'bindval'('Trains','|||'('agent_call'('src_span'(83,10,83,15,2665,5),'Train',['Train1','int'(0)]),'agent_call'('src_span'(83,30,83,35,2685,5),'Train',['Train2','int'(0)]),'src_span_operator'('no_loc_info_available','src_span'(83,26,83,29,2681,3))),'src_span'(83,1,83,45,2656,44)).
'agent'('Track'(_j2),'let'(['bindval'('Empty','prefix'('src_span'(90,15,90,22,2880,7),['in'(_A2)],'dotTuple'(['enter',_j2]),'ifte'('=='(_j2,'int'(1)),'prefix'('src_span'(90,41,90,50,2906,9),[],'dotTuple'(['sensor','in']),'agent_call'('src_span'(90,54,90,58,2919,4),'Full',[_A2]),'src_span'(90,51,90,53,2915,20)),'agent_call'('src_span'(90,67,90,71,2932,4),'Full',[_A2]),'no_loc_info_available','no_loc_info_available','src_span'(90,62,90,66,2926,33)),'src_span'(90,25,90,27,2889,52)),'src_span'(90,5,90,74,2870,69)),'agent'('Full'(_A3),'prefix'('src_span'(91,15,91,24,2954,9),[],'dotTuple'(['leave',_j2,_A3]),'ifte'('=='(_j2,'val_of'('GateSeg','src_span'(91,34,91,41,2973,7))),'prefix'('src_span'(91,47,91,57,2986,10),[],'dotTuple'(['sensor','out']),'val_of'('Empty','src_span'(91,61,91,66,3000,5)),'src_span'(91,58,91,60,2996,19)),'val_of'('Empty','src_span'(91,72,91,77,3011,5)),'no_loc_info_available','no_loc_info_available','src_span'(91,67,91,71,3005,30)),'src_span'(91,25,91,27,2963,62)),'src_span'(91,15,91,77,2954,62))],'val_of'('Empty','src_span'(92,10,92,15,3026,5))),'src_span'(89,3,92,15,2862,169)).
'bindval'('Tracks','repInterleave'(['comprehensionGenerator'(_j3,'val_of'('REALTRACKS','src_span'(97,18,97,28,3137,10)))],'agent_call'('src_span'(97,31,97,36,3150,5),'Track',[_j3]),'src_span'(97,14,97,30,3133,16)),'src_span'(97,1,97,39,3120,38)).
'bindval'('Network','sharing'('closureComp'(['comprehensionGenerator'(_j4,'val_of'('REALTRACKS','src_span'(103,44,103,54,3401,10)))],['dotTuple'(['enter',_j4]),'dotTuple'(['leave',_j4])]),'val_of'('Trains','src_span'(103,11,103,17,3368,6)),'val_of'('Tracks','src_span'(103,59,103,65,3416,6)),'src_span'(103,18,103,58,3375,40)),'src_span'(103,1,103,65,3358,64)).
'bindval'('SlowTrain','int'(4),'src_span'(109,1,109,14,3621,13)).
'bindval'('NormalTrain','int'(3),'src_span'(110,1,110,16,3688,15)).
'bindval'('FastTrain','int'(2),'src_span'(111,1,111,14,3704,13)).
'bindval'('MaxTocksPerSeg','int'(6),'src_span'(113,1,113,19,3719,18)).
'agent'('SpeedReg'(_j5,_MinTocksPerSeg),'let'(['bindval'('Empty2','[]'('prefix'('src_span'(120,15,120,22,3877,7),['in'(_A4)],'dotTuple'(['enter',_j5]),'agent_call'('src_span'(120,28,120,32,3890,4),'Full2',['int'(0)]),'src_span'(120,25,120,27,3886,13)),'prefix'('src_span'(120,39,120,43,3901,4),[],'tock','val_of'('Empty2','src_span'(120,47,120,52,3909,5)),'src_span'(120,44,120,46,3905,13)),'src_span_operator'('no_loc_info_available','src_span'(120,36,120,38,3898,2))),'src_span'(120,5,120,52,3867,47)),'agent'('Full2'(_n),'[]'('&'('<'(_n,'val_of'('MaxTocksPerSeg','src_span'(121,20,121,34,3934,14))),'prefix'('src_span'(121,37,121,41,3951,4),[],'tock','agent_call'('src_span'(121,45,121,49,3959,4),'Full2',['+'(_n,'int'(1))]),'src_span'(121,42,121,44,3955,17))),'&'('<='(_MinTocksPerSeg,_n),'prefix'('src_span'(122,37,122,57,4006,20),['in'(_A5)],'dotTuple'(['enter','%'('+'(_j5,'int'(1)),'val_of'('Segments','src_span'(122,49,122,57,4018,8)))]),'val_of'('Empty2','src_span'(122,63,122,68,4032,5)),'src_span'(122,60,122,62,4028,11))),'src_span_operator'('no_loc_info_available','src_span'(122,12,122,14,3981,2))),'no_loc_info_available')],'val_of'('Empty2','src_span'(123,10,123,15,4047,5))),'src_span'(119,3,123,15,3859,193)).
'bindval'('InSensorTiming','[]'('prefix'('src_span'(129,18,129,22,4239,4),[],'tock','val_of'('InSensorTiming','src_span'(129,26,129,40,4247,14)),'src_span'(129,23,129,25,4243,22)),'prefix'('src_span'(130,18,130,25,4279,7),['in'(_A6)],'dotTuple'(['enter','int'(1)]),'prefix'('src_span'(130,31,130,40,4292,9),[],'dotTuple'(['sensor','in']),'val_of'('InSensorTiming','src_span'(130,44,130,58,4305,14)),'src_span'(130,41,130,43,4301,27)),'src_span'(130,28,130,30,4288,33)),'src_span_operator'('no_loc_info_available','src_span'(130,15,130,17,4276,2))),'src_span'(129,1,130,58,4222,97)).
'bindval'('OutSensorTiming','[]'('prefix'('src_span'(132,19,132,23,4339,4),[],'tock','val_of'('OutSensorTiming','src_span'(132,27,132,42,4347,15)),'src_span'(132,24,132,26,4343,23)),'prefix'('src_span'(133,19,133,32,4381,13),['in'(_A7)],'dotTuple'(['leave','val_of'('GateSeg','src_span'(133,25,133,32,4387,7))]),'prefix'('src_span'(133,38,133,48,4400,10),[],'dotTuple'(['sensor','out']),'val_of'('OutSensorTiming','src_span'(133,52,133,67,4414,15)),'src_span'(133,49,133,51,4410,29)),'src_span'(133,35,133,37,4396,35)),'src_span_operator'('no_loc_info_available','src_span'(133,16,133,18,4378,2))),'src_span'(132,1,133,67,4321,108)).
'agent'('SpeedRegs'(_min),'procRepAParallel'(['comprehensionGenerator'(_j6,'val_of'('REALTRACKS','src_span'(139,10,139,20,4613,10)))],'pair'('closure'(['tock','dotTuple'(['enter',_j6]),'dotTuple'(['enter','%'('+'(_j6,'int'(1)),'val_of'('Segments','src_span'(139,53,139,61,4656,8)))])]),'agent_call'('src_span'(139,65,139,73,4668,8),'SpeedReg',[_j6,_min])),'src_span'(139,6,139,22,4609,16)),'src_span'(139,3,139,80,4606,77)).
'bindval'('SensorTiming','sharing'('setExp'('rangeEnum'(['tock'])),'val_of'('InSensorTiming','src_span'(144,16,144,30,4748,14)),'val_of'('OutSensorTiming','src_span'(144,42,144,57,4774,15)),'src_span'(144,31,144,41,4763,10)),'src_span'(144,1,144,57,4733,56)).
'agent'('NetworkTiming'(_min2),'sharing'('closure'(['tock','dotTuple'(['enter','int'(1)])]),'agent_call'('src_span'(146,22,146,31,4812,9),'SpeedRegs',[_min2]),'val_of'('SensorTiming','src_span'(146,59,146,71,4849,12)),'src_span'(146,37,146,58,4827,21)),'src_span'(146,37,146,58,4827,21)).
'agent'('TimedNetwork'(_min3),'sharing'('closure'(['enter','sensor','dotTuple'(['leave','val_of'('GateSeg','src_span'(149,36,149,43,4918,7))])]),'val_of'('Network','src_span'(149,3,149,10,4885,7)),'agent_call'('src_span'(149,48,149,61,4930,13),'NetworkTiming',[_min3]),'src_span'(149,11,149,47,4893,36)),'src_span'(149,11,149,47,4893,36)).
'bindval'('Controller','let'(['bindval'('ControllerUp','[]'('[]'('prefix'('src_span'(170,20,170,29,5844,9),[],'dotTuple'(['sensor','in']),'prefix'('src_span'(170,33,170,37,5857,4),['out'('go_down')],'gate','agent_call'('src_span'(170,49,170,68,5873,19),'ControllerGoingDown',['int'(1)]),'src_span'(170,46,170,48,5869,34)),'src_span'(170,30,170,32,5853,51)),'prefix'('src_span'(171,20,171,30,5915,10),[],'dotTuple'(['sensor','out']),'val_of'('ERROR','src_span'(171,34,171,39,5929,5)),'src_span'(171,31,171,33,5925,19)),'src_span_operator'('no_loc_info_available','src_span'(171,17,171,19,5912,2))),'prefix'('src_span'(172,20,172,24,5954,4),[],'tock','val_of'('ControllerUp','src_span'(172,28,172,40,5962,12)),'src_span'(172,25,172,27,5958,20)),'src_span_operator'('no_loc_info_available','src_span'(172,17,172,19,5951,2))),'src_span'(170,5,172,40,5829,145)),'agent'('ControllerGoingDown'(_n2),'[]'('[]'('[]'('ifte'('<'('val_of'('GateSeg','src_span'(183,14,183,21,6507,7)),_n2),'val_of'('ERROR','src_span'(183,31,183,36,6524,5)),'prefix'('src_span'(183,42,183,51,6535,9),[],'dotTuple'(['sensor','in']),'agent_call'('src_span'(183,55,183,74,6548,19),'ControllerGoingDown',['+'(_n2,'int'(1))]),'src_span'(183,52,183,54,6544,37)),'no_loc_info_available','no_loc_info_available','src_span'(183,37,183,41,6529,48)),'prefix'('src_span'(184,10,184,19,6583,9),[],'dotTuple'(['gate','down']),'agent_call'('src_span'(184,23,184,37,6596,14),'ControllerDown',[_n2]),'src_span'(184,20,184,22,6592,30)),'src_span_operator'('no_loc_info_available','src_span'(184,7,184,9,6580,2))),'prefix'('src_span'(185,10,185,14,6623,4),[],'tock','agent_call'('src_span'(185,18,185,37,6631,19),'ControllerGoingDown',[_n2]),'src_span'(185,15,185,17,6627,30)),'src_span_operator'('no_loc_info_available','src_span'(185,7,185,9,6620,2))),'prefix'('src_span'(186,10,186,20,6663,10),[],'dotTuple'(['sensor','out']),'val_of'('ERROR','src_span'(186,24,186,29,6677,5)),'src_span'(186,21,186,23,6673,19)),'src_span_operator'('no_loc_info_available','src_span'(186,7,186,9,6660,2))),'no_loc_info_available'),'agent'('ControllerDown'(_n3),'[]'('[]'('ifte'('<'('val_of'('GateSeg','src_span'(194,14,194,21,7100,7)),_n3),'val_of'('ERROR','src_span'(194,31,194,36,7117,5)),'prefix'('src_span'(194,42,194,51,7128,9),[],'dotTuple'(['sensor','in']),'agent_call'('src_span'(194,55,194,69,7141,14),'ControllerDown',['+'(_n3,'int'(1))]),'src_span'(194,52,194,54,7137,32)),'no_loc_info_available','no_loc_info_available','src_span'(194,37,194,41,7122,43)),'prefix'('src_span'(195,10,195,20,7171,10),[],'dotTuple'(['sensor','out']),'ifte'('=='(_n3,'int'(1)),'prefix'('src_span'(195,38,195,42,7199,4),['out'('go_up')],'gate','val_of'('ControllerGoingUp','src_span'(195,52,195,69,7213,17)),'src_span'(195,49,195,51,7209,27)),'agent_call'('src_span'(196,38,196,52,7269,14),'ControllerDown',['-'(_n3,'int'(1))]),'no_loc_info_available','no_loc_info_available','src_span'(195,70,196,37,7230,89)),'src_span'(195,21,195,23,7181,118)),'src_span_operator'('no_loc_info_available','src_span'(195,7,195,9,7168,2))),'prefix'('src_span'(197,10,197,14,7299,4),[],'tock','agent_call'('src_span'(197,18,197,32,7307,14),'ControllerDown',[_n3]),'src_span'(197,15,197,17,7303,25)),'src_span_operator'('no_loc_info_available','src_span'(197,7,197,9,7296,2))),'no_loc_info_available'),'bindval'('ControllerGoingUp','[]'('[]'('[]'('prefix'('src_span'(201,26,201,30,7541,4),['out'('up')],'gate','val_of'('ControllerUp','src_span'(201,37,201,49,7552,12)),'src_span'(201,34,201,36,7548,19)),'prefix'('src_span'(202,25,202,29,7589,4),[],'tock','val_of'('ControllerGoingUp','src_span'(202,33,202,50,7597,17)),'src_span'(202,30,202,32,7593,25)),'src_span_operator'('no_loc_info_available','src_span'(202,22,202,24,7586,2))),'prefix'('src_span'(203,25,203,34,7639,9),[],'dotTuple'(['sensor','in']),'prefix'('src_span'(203,38,203,42,7652,4),['out'('go_down')],'gate','agent_call'('src_span'(203,54,203,73,7668,19),'ControllerGoingDown',['int'(1)]),'src_span'(203,51,203,53,7664,34)),'src_span'(203,35,203,37,7648,51)),'src_span_operator'('no_loc_info_available','src_span'(203,22,203,24,7636,2))),'prefix'('src_span'(204,25,204,35,7715,10),[],'dotTuple'(['sensor','out']),'val_of'('ERROR','src_span'(204,39,204,44,7729,5)),'src_span'(204,36,204,38,7725,19)),'src_span_operator'('no_loc_info_available','src_span'(204,22,204,24,7712,2))),'src_span'(201,5,204,44,7520,214))],'val_of'('ControllerUp','src_span'(205,10,205,22,7744,12))),'src_span'(163,1,205,22,5514,2242)).
'bindval'('ERROR','prefix'('src_span'(211,9,211,14,7964,5),[],'error','stop'('src_span'(211,18,211,22,7973,4)),'src_span'(211,15,211,17,7969,13)),'src_span'(211,1,211,22,7956,21)).
'bindval'('VeryFastGate','int'(3),'src_span'(217,1,217,17,8168,16)).
'bindval'('FastGate','int'(4),'src_span'(218,1,218,13,8185,12)).
'bindval'('NormalGate','int'(5),'src_span'(219,1,219,15,8198,14)).
'bindval'('SlowGate','int'(6),'src_span'(220,1,220,13,8213,12)).
'bindval'('UpTime','int'(2),'src_span'(222,1,222,11,8227,10)).
'agent'('Gate'(_DownTime),'let'(['bindval'('GateUp','[]'('[]'('prefix'('src_span'(226,14,226,24,8275,10),[],'dotTuple'(['gate','go_up']),'val_of'('GateUp','src_span'(226,28,226,34,8289,6)),'src_span'(226,25,226,27,8285,20)),'prefix'('src_span'(227,14,227,26,8309,12),[],'dotTuple'(['gate','go_down']),'agent_call'('src_span'(227,30,227,43,8325,13),'GateGoingDown',['int'(0)]),'src_span'(227,27,227,29,8321,32)),'src_span_operator'('no_loc_info_available','src_span'(227,11,227,13,8306,2))),'prefix'('src_span'(228,7,228,11,8348,4),[],'tock','val_of'('GateUp','src_span'(228,15,228,21,8356,6)),'src_span'(228,12,228,14,8352,14)),'src_span_operator'('no_loc_info_available','src_span'(228,4,228,6,8345,2))),'src_span'(226,5,228,21,8266,96)),'agent'('GateGoingDown'(_n4),'[]'('prefix'('src_span'(230,10,230,22,8395,12),[],'dotTuple'(['gate','go_down']),'agent_call'('src_span'(230,26,230,39,8411,13),'GateGoingDown',[_n4]),'src_span'(230,23,230,25,8407,32)),'ifte'('=='(_n4,_DownTime),'prefix'('src_span'(232,15,232,24,8468,9),[],'dotTuple'(['gate','down']),'val_of'('GateDown','src_span'(232,28,232,36,8481,8)),'src_span'(232,25,232,27,8477,21)),'|~|'('prefix'('src_span'(233,8,233,17,8497,9),[],'dotTuple'(['gate','down']),'val_of'('GateDown','src_span'(233,21,233,29,8510,8)),'src_span'(233,18,233,20,8506,21)),'prefix'('src_span'(233,34,233,38,8523,4),[],'tock','agent_call'('src_span'(233,42,233,55,8531,13),'GateGoingDown',['+'(_n4,'int'(1))]),'src_span'(233,39,233,41,8527,26)),'src_span_operator'('no_loc_info_available','src_span'(233,30,233,33,8519,3))),'no_loc_info_available','no_loc_info_available','no_loc_info_available'),'src_span_operator'('no_loc_info_available','src_span'(231,7,231,9,8434,2))),'no_loc_info_available'),'bindval'('GateDown','[]'('[]'('prefix'('src_span'(234,16,234,28,8565,12),[],'dotTuple'(['gate','go_down']),'val_of'('GateDown','src_span'(234,32,234,40,8581,8)),'src_span'(234,29,234,31,8577,24)),'prefix'('src_span'(235,16,235,26,8605,10),[],'dotTuple'(['gate','go_up']),'agent_call'('src_span'(235,30,235,41,8619,11),'GateGoingUp',['int'(0)]),'src_span'(235,27,235,29,8615,28)),'src_span_operator'('no_loc_info_available','src_span'(235,13,235,15,8602,2))),'prefix'('src_span'(236,9,236,13,8642,4),[],'tock','val_of'('GateDown','src_span'(236,17,236,25,8650,8)),'src_span'(236,14,236,16,8646,16)),'src_span_operator'('no_loc_info_available','src_span'(236,6,236,8,8639,2))),'src_span'(234,5,236,25,8554,104)),'agent'('GateGoingUp'(_n5),'[]'('[]'('prefix'('src_span'(237,22,237,32,8680,10),[],'dotTuple'(['gate','go_up']),'agent_call'('src_span'(237,36,237,47,8694,11),'GateGoingUp',[_n5]),'src_span'(237,33,237,35,8690,28)),'prefix'('src_span'(238,22,238,34,8730,12),[],'dotTuple'(['gate','go_down']),'agent_call'('src_span'(238,38,238,51,8746,13),'GateGoingDown',['int'(0)]),'src_span'(238,35,238,37,8742,32)),'src_span_operator'('no_loc_info_available','src_span'(238,19,238,21,8727,2))),'ifte'('=='(_n5,'val_of'('UpTime','src_span'(239,30,239,36,8792,6))),'prefix'('src_span'(240,27,240,34,8825,7),[],'dotTuple'(['gate','up']),'val_of'('GateUp','src_span'(240,38,240,44,8836,6)),'src_span'(240,35,240,37,8832,17)),'|~|'('prefix'('src_span'(241,20,241,27,8862,7),[],'dotTuple'(['gate','up']),'val_of'('GateUp','src_span'(241,31,241,37,8873,6)),'src_span'(241,28,241,30,8869,17)),'prefix'('src_span'(241,42,241,46,8884,4),[],'tock','agent_call'('src_span'(241,50,241,61,8892,11),'GateGoingUp',['+'(_n5,'int'(1))]),'src_span'(241,47,241,49,8888,24)),'src_span_operator'('no_loc_info_available','src_span'(241,38,241,41,8880,3))),'no_loc_info_available','no_loc_info_available','no_loc_info_available'),'src_span_operator'('no_loc_info_available','src_span'(239,19,239,21,8781,2))),'no_loc_info_available')],'val_of'('GateUp','src_span'(242,10,242,16,8918,6))),'src_span'(225,3,242,16,8258,666)).
'cspTransparent'(['sbisim']).
'cspTransparent'(['normalise']).
'cspTransparent'(['explicate']).
'cspTransparent'(['diamond']).
'agent'('GateAndController'(_dt),'sharing'('closure'(['tock','gate']),'val_of'('Controller','src_span'(257,25,257,35,9404,10)),'agent_call'('src_span'(257,54,257,61,9433,7),'diamond',['agent_call'('src_span'(257,62,257,66,9441,4),'Gate',[_dt])]),'src_span'(257,36,257,53,9415,17)),'src_span'(257,36,257,53,9415,17)).
'agent'('System'(_invmaxspeed,_gatedowntime),'sharing'('closure'(['sensor','tock']),'agent_call'('src_span'(263,3,263,15,9579,12),'TimedNetwork',[_invmaxspeed]),'agent_call'('src_span'(263,49,263,66,9625,17),'GateAndController',[_gatedowntime]),'src_span'(263,29,263,48,9605,19)),'src_span'(263,29,263,48,9605,19)).
'bindval'('MAIN','agent_call'('src_span'(266,8,266,14,9666,6),'System',['val_of'('NormalTrain','src_span'(266,15,266,26,9673,11)),'val_of'('NormalGate','src_span'(266,27,266,37,9685,10))]),'src_span'(266,1,266,38,9659,37)).
'bindval'('MAIN1','agent_call'('src_span'(267,10,267,27,9728,17),'GateAndController',['val_of'('NormalGate','src_span'(267,28,267,38,9746,10))]),'src_span'(267,2,267,39,9720,37)).
'bindval'('MAIN2','agent_call'('src_span'(268,10,268,22,9781,12),'TimedNetwork',['val_of'('NormalTrain','src_span'(268,23,268,34,9794,11))]),'src_span'(268,2,268,35,9773,33)).
'bindval'('MAIN21','val_of'('Network','src_span'(269,12,269,19,9833,7)),'src_span'(269,3,269,19,9824,16)).
'bindval'('MAIN22','agent_call'('src_span'(270,12,270,25,9866,13),'NetworkTiming',['val_of'('NormalTrain','src_span'(270,26,270,37,9880,11))]),'src_span'(270,3,270,38,9857,35)).
'bindval'('NoError','builtin_call'('CHAOS'('src_span'(275,11,275,38,10088,27),'agent_call'('src_span'(275,17,275,21,10094,4),'diff',['Events','setExp'('rangeEnum'(['error']))]))),'src_span'(275,1,275,38,10078,37)).
'assertRef'('False','val_of'('NoError','src_span'(277,8,277,15,10124,7)),'Trace','agent_call'('src_span'(277,20,277,26,10136,6),'System',['val_of'('NormalTrain','src_span'(277,27,277,38,10143,11)),'val_of'('NormalGate','src_span'(277,39,277,49,10155,10))]),'src_span'(277,1,277,50,10117,49)).
'agent'('SETBETWEENx'(_EN,_DIS,_C),'[]'('repChoice'(['comprehensionGenerator'(_x,_EN)],'prefix'('src_span'(287,35,287,36,10596,1),[],_x,'agent_call'('src_span'(287,40,287,51,10601,11),'SETOUTSIDEx',[_DIS,_EN,_C]),'src_span'(287,37,287,39,10597,26)),'src_span'(287,28,287,34,10589,6)),'repChoice'(['comprehensionGenerator'(_x2,_DIS)],'prefix'('src_span'(288,40,288,41,10663,1),[],_x2,'agent_call'('src_span'(288,45,288,56,10668,11),'SETBETWEENx',[_EN,_DIS,_C]),'src_span'(288,42,288,44,10664,26)),'src_span'(288,32,288,39,10655,7)),'src_span_operator'('no_loc_info_available','src_span'(288,25,288,27,10648,2))),'no_loc_info_available').
'agent'('SETOUTSIDEx'(_DIS2,_EN2,_C2),'[]'('[]'('repChoice'(['comprehensionGenerator'(_c,_C2)],'prefix'('src_span'(290,35,290,36,10726,1),[],_c,'agent_call'('src_span'(290,40,290,51,10731,11),'SETOUTSIDEx',[_DIS2,_EN2,_C2]),'src_span'(290,37,290,39,10727,26)),'src_span'(290,29,290,34,10720,5)),'repChoice'(['comprehensionGenerator'(_x3,_EN2)],'prefix'('src_span'(291,40,291,41,10793,1),[],_x3,'agent_call'('src_span'(291,45,291,56,10798,11),'SETOUTSIDEx',[_DIS2,_EN2,_C2]),'src_span'(291,42,291,44,10794,26)),'src_span'(291,32,291,39,10785,7)),'src_span_operator'('no_loc_info_available','src_span'(291,25,291,27,10778,2))),'repChoice'(['comprehensionGenerator'(_x4,_DIS2)],'prefix'('src_span'(292,40,292,41,10860,1),[],_x4,'agent_call'('src_span'(292,45,292,56,10865,11),'SETBETWEENx',[_EN2,_DIS2,_C2]),'src_span'(292,42,292,44,10861,26)),'src_span'(292,32,292,39,10852,7)),'src_span_operator'('no_loc_info_available','src_span'(292,25,292,27,10845,2))),'no_loc_info_available').
'bindval'('EnterWhenDown','sharing'('closure'(['gate','dotTuple'(['enter','val_of'('GateSeg','src_span'(303,19,303,26,11299,7))])]),'agent_call'('src_span'(300,3,300,14,11174,11),'SETBETWEENx',['setExp'('rangeEnum'(['dotTuple'(['gate','down'])])),'setExp'('rangeEnum'(['dotTuple'(['gate','up']),'dotTuple'(['gate','go_up']),'dotTuple'(['gate','go_down'])])),'closure'(['dotTuple'(['enter','val_of'('GateSeg','src_span'(302,23,302,30,11270,7))])])]),'builtin_call'('CHAOS'('src_span'(304,3,304,16,11313,13),'Events')),'src_span'(303,3,303,30,11283,27)),'src_span'(299,1,304,16,11156,170)).
'bindval'('GateStillWhenTrain','sharing'('closure'(['gate','dotTuple'(['enter','val_of'('GateSeg','src_span'(308,18,308,25,11426,7))]),'dotTuple'(['leave','val_of'('GateSeg','src_span'(308,32,308,39,11440,7))])]),'agent_call'('src_span'(307,3,307,14,11351,11),'SETOUTSIDEx',['closure'(['dotTuple'(['enter','val_of'('GateSeg','src_span'(307,23,307,30,11371,7))])]),'closure'(['dotTuple'(['leave','val_of'('GateSeg','src_span'(307,41,307,48,11389,7))])]),'closure'(['gate'])]),'builtin_call'('CHAOS'('src_span'(309,3,309,16,11454,13),'Events')),'src_span'(308,3,308,43,11411,40)),'src_span'(306,1,309,16,11328,139)).
'bindval'('Safety','sharing'('Events','val_of'('EnterWhenDown','src_span'(313,10,313,23,11539,13)),'val_of'('GateStillWhenTrain','src_span'(313,35,313,53,11564,18)),'src_span'(313,24,313,34,11553,10)),'src_span'(313,1,313,53,11530,52)).
'assertRef'('False','val_of'('Safety','src_span'(324,8,324,14,12017,6)),'Trace','agent_call'('src_span'(324,19,324,25,12028,6),'System',['val_of'('FastTrain','src_span'(324,26,324,35,12035,9)),'val_of'('VeryFastGate','src_span'(324,36,324,48,12045,12))]),'src_span'(324,1,324,49,12010,48)).
'bindval'('TOCKS','prefix'('src_span'(331,9,331,13,12238,4),[],'tock','val_of'('TOCKS','src_span'(331,17,331,22,12246,5)),'src_span'(331,14,331,16,12242,13)),'src_span'(331,1,331,22,12230,21)).
'bindval'('Delayable','closure'(['dotTuple'(['enter','int'(1)])]),'src_span'(336,1,336,24,12348,23)).
'bindval'('NonTock','agent_call'('src_span'(337,11,337,15,12382,4),'diff',['Events','setExp'('rangeEnum'(['tock']))]),'src_span'(337,1,337,30,12372,29)).
'agent'('TimingConsistency'(_ts,_gs),'agent_call'('src_span'(339,3,339,12,12431,9),'explicate',['\x5c\'('sharing'('val_of'('Delayable','src_span'(339,28,339,37,12456,9)),'agent_call'('src_span'(339,13,339,19,12441,6),'System',[_ts,_gs]),'agent_call'('src_span'(339,39,339,48,12467,9),'normalise',['builtin_call'('CHAOS'('src_span'(339,49,339,65,12477,16),'val_of'('Delayable','src_span'(339,55,339,64,12483,9))))]),'src_span'(339,26,339,39,12454,13)),'val_of'('NonTock','src_span'(339,67,339,74,12495,7)),'src_span_operator'('no_loc_info_available','src_span'(339,66,339,67,12494,1)))]),'src_span'(339,3,339,75,12431,72)).
'agent'('Liveness'(_X),'let'(['bindval'('Idle','[]'('prefix'('src_span'(360,12,360,16,13506,4),[],'tock','val_of'('Idle','src_span'(360,20,360,24,13514,4)),'src_span'(360,17,360,19,13510,12)),'prefix'('src_span'(361,12,361,19,13530,7),['in'(_)],'dotTuple'(['enter','int'(1)]),'agent_call'('src_span'(361,25,361,29,13543,4),'Busy',['int'(1)]),'src_span'(361,22,361,24,13539,13)),'src_span_operator'('no_loc_info_available','src_span'(361,9,361,11,13527,2))),'src_span'(360,5,361,32,13499,51)),'agent'('Busy'(_n6),'[]'('[]'('[]'('prefix'('src_span'(362,15,362,19,13565,4),[],'tock','agent_call'('src_span'(362,23,362,27,13573,4),'Busy',[_n6]),'src_span'(362,20,362,22,13569,15)),'prefix'('src_span'(363,15,363,22,13595,7),['in'(_)],'dotTuple'(['enter','int'(1)]),'agent_call'('src_span'(363,28,363,32,13608,4),'Busy',['ifte'('<'(_n6,'val_of'('GateSeg','src_span'(363,40,363,47,13620,7))),'+'(_n6,'int'(1)),_n6,'no_loc_info_available','no_loc_info_available','src_span'(363,59,363,63,13638,12))]),'src_span'(363,25,363,27,13604,44)),'src_span_operator'('no_loc_info_available','src_span'(363,12,363,14,13592,2))),'prefix'('src_span'(364,15,364,28,13661,13),['in'(_)],'dotTuple'(['leave','val_of'('GateSeg','src_span'(364,21,364,28,13667,7))]),'ifte'('=='(_n6,'int'(1)),'agent_call'('src_span'(364,48,364,56,13694,8),'UpBefore',[_X]),'agent_call'('src_span'(364,65,364,69,13711,4),'Busy',['-'(_n6,'int'(1))]),'no_loc_info_available','no_loc_info_available','src_span'(364,60,364,64,13705,26)),'src_span'(364,31,364,33,13676,47)),'src_span_operator'('no_loc_info_available','src_span'(364,12,364,14,13658,2))),'prefix'('src_span'(365,15,365,19,13736,4),['in'(_)],'gate','agent_call'('src_span'(365,25,365,29,13746,4),'Busy',[_n6]),'src_span'(365,22,365,24,13742,13)),'src_span_operator'('no_loc_info_available','src_span'(365,12,365,14,13733,2))),'no_loc_info_available'),'agent'('UpBefore'(_m),'[]'('[]'('&'('!='(_m,'int'(0)),'prefix'('src_span'(366,28,366,32,13781,4),[],'tock','agent_call'('src_span'(366,36,366,44,13789,8),'UpBefore',['-'(_m,'int'(1))]),'src_span'(366,33,366,35,13785,21))),'prefix'('src_span'(367,19,367,23,13821,4),['in'(_x5)],'gate','ifte'('=='(_x5,'up'),'val_of'('Idle','src_span'(367,44,367,48,13846,4)),'agent_call'('src_span'(367,54,367,62,13856,8),'UpBefore',[_m]),'no_loc_info_available','no_loc_info_available','src_span'(367,49,367,53,13850,21)),'src_span'(367,26,367,28,13827,43)),'src_span_operator'('no_loc_info_available','src_span'(367,16,367,18,13818,2))),'prefix'('src_span'(368,19,368,26,13887,7),['in'(_)],'dotTuple'(['enter','int'(1)]),'agent_call'('src_span'(368,32,368,36,13900,4),'Busy',['int'(1)]),'src_span'(368,29,368,31,13896,13)),'src_span_operator'('no_loc_info_available','src_span'(368,16,368,18,13884,2))),'no_loc_info_available')],'val_of'('Idle','src_span'(371,10,371,14,14018,4))),'src_span'(359,3,371,14,13491,531)).
'agent'('GateLive'(_X2),'sharing'('closure'(['tock','gate','dotTuple'(['enter','int'(1)]),'dotTuple'(['leave','val_of'('GateSeg','src_span'(373,55,373,62,14095,7))])]),'agent_call'('src_span'(373,15,373,23,14055,8),'Liveness',[_X2]),'builtin_call'('CHAOS'('src_span'(373,66,373,79,14106,13),'Events')),'src_span'(373,27,373,66,14067,39)),'src_span'(373,27,373,66,14067,39)).
'pragma'(' assert_ltl "SF(enter._._) & SF(leave._._) => G F [enter._._]" "26.344 atoms, checked for 39.594 ms" ').
'pragma'(' assert_ltl "((GF e(enter._._) => GF [enter._._]) & (GF e(leave._._) => GF [leave._._])) => G F [enter._._]" "26.344 atoms, checked for 39.594 ms" ').
'pragma'(' assert_ltl "(GF e(enter._._) => GF [enter._._]) => G F [enter._._]" "26.344 atoms, checked for 39.594 ms" ').
'pragma'(' assert_ltl "G F [enter.4.Train1]" "26.344 atoms, checked for 39.594 ms" ').
'comment'('lineComment'('-- Model of a level crossing gate for FDR: revised version'),'src_position'(1,1,0,58)).
'comment'('lineComment'('-- Illustrating discrete-time modelling using untimed CSP'),'src_position'(2,1,59,57)).
'comment'('lineComment'('-- (c) Bill Roscoe, November 1992 and July 1995'),'src_position'(4,1,118,47)).
'comment'('lineComment'('-- Revised for FDR 2.11 May 1997'),'src_position'(5,1,166,32)).
'comment'('blockComment'('{-\xa\  This file contains a revised version, to coincide with my 1995\xa\  notes, of the level crossing gate example which was the first CSP\xa\  program to use the "tock" model of time.\xa\\xa\  The present version has (I think) a marginally better incorporation\xa\  of timing information.\xa\-}'),'src_position'(7,1,200,277)).
'comment'('lineComment'('-- Time to compute state space: 58.5 seconds'),'src_position'(16,1,479,44)).
'comment'('lineComment'('-- LTL Formulas'),'src_position'(18,1,525,15)).
'comment'('lineComment'('-- G F e(enter._._) -> TRUE 0.271 secs'),'src_position'(19,1,541,38)).
'comment'('lineComment'('-- G F [enter._._] -> FALSE 0.175 secs'),'src_position'(20,1,580,38)).
'comment'('pragmaComment'('{-# assert_ltl "SF(enter._._) & SF(leave._._) => G F [enter._._]" "26.344 atoms, checked for 39.594 ms" #-}'),'src_position'(22,1,620,107)).
'comment'('pragmaComment'('{-# assert_ltl "((GF e(enter._._) => GF [enter._._]) & (GF e(leave._._) => GF [leave._._])) => G F [enter._._]" "26.344 atoms, checked for 39.594 ms" #-}'),'src_position'(23,1,728,153)).
'comment'('pragmaComment'('{-# assert_ltl "(GF e(enter._._) => GF [enter._._]) => G F [enter._._]" "26.344 atoms, checked for 39.594 ms" #-}'),'src_position'(24,1,882,113)).
'comment'('pragmaComment'('{-# assert_ltl "G F [enter.4.Train1]" "26.344 atoms, checked for 39.594 ms" #-}'),'src_position'(25,1,996,79)).
'comment'('lineComment'('-- The tock event represents the passing of a unit of time'),'src_position'(27,1,1077,58)).
'comment'('lineComment'('-- The following are the communications between the controller process and'),'src_position'(31,1,1151,74)).
'comment'('lineComment'('-- the gate process'),'src_position'(32,1,1226,19)).
'comment'('lineComment'('-- where we can think of the first two as being commands to it, and the'),'src_position'(36,1,1299,71)).
'comment'('lineComment'('-- last two as being confirmations from a sensor that they are up or down.'),'src_position'(37,1,1371,74)).
'comment'('lineComment'('-- For reasons discussed below, we introduce a special error event:'),'src_position'(41,1,1475,67)).
'comment'('lineComment'('-- To model the speed of trains, and also the separation of more than one'),'src_position'(45,1,1559,73)).
'comment'('lineComment'('-- trains, we divide the track into segments that the trains can enter or'),'src_position'(46,1,1633,73)).
'comment'('lineComment'('-- leave.'),'src_position'(47,1,1707,9)).
'comment'('lineComment'('-- the number of segments including the outside one'),'src_position'(49,14,1731,51)).
'comment'('lineComment'('-- Here, segment 0 represents theo outside world, and [1,Segment) actual'),'src_position'(54,1,1855,72)).
'comment'('lineComment'('-- track segments; including the crossing, which is at'),'src_position'(55,1,1928,54)).
'comment'('lineComment'('-- This model handles two trains'),'src_position'(59,1,1995,32)).
'comment'('lineComment'('-- which can move between track segments'),'src_position'(63,1,2064,40)).
'comment'('lineComment'('-- Trains are detected when they enter the first track segment by a sensor,'),'src_position'(67,1,2144,75)).
'comment'('lineComment'('-- which drives the controller, and are also detected by a second sensor'),'src_position'(68,1,2220,72)).
'comment'('lineComment'('-- when they leave GateSeg'),'src_position'(69,1,2293,26)).
'comment'('lineComment'('-- The following gives an untimed description of Train A on track segment j'),'src_position'(76,1,2375,75)).
'comment'('lineComment'('-- A train not currently in the domain of interest is given index 0.'),'src_position'(77,1,2451,68)).
'comment'('lineComment'('-- There is no direct interference between the trains'),'src_position'(81,1,2601,53)).
'comment'('lineComment'('-- The real track segments can be occupied by one train at a time, and each'),'src_position'(85,1,2702,75)).
'comment'('lineComment'('-- time a train enters segment 1 or leaves GateSeg the sensors fire.'),'src_position'(86,1,2778,68)).
'comment'('lineComment'('-- Like the trains, the untimed track segments do not communicate with '),'src_position'(94,1,3033,71)).
'comment'('lineComment'('-- each other'),'src_position'(95,1,3105,13)).
'comment'('lineComment'('-- And we can put together the untimed network, noting that since there is'),'src_position'(99,1,3160,74)).
'comment'('lineComment'('-- no process modelling the outside world there is no need to synchronise'),'src_position'(100,1,3235,73)).
'comment'('lineComment'('-- on the enter and leave events for this area.'),'src_position'(101,1,3309,47)).
'comment'('lineComment'('-- We make assumptions about the speed of trains by placing (uniform)'),'src_position'(105,1,3424,69)).
'comment'('lineComment'('-- upper and lower "speed limits" on the track segments:'),'src_position'(106,1,3494,56)).
'comment'('lineComment'('-- MinTocksPerSeg = 3 -- make this a parameter to experiment with it'),'src_position'(108,1,3552,68)).
'comment'('lineComment'('-- inverse speed parameter, MinTocksPerSegment'),'src_position'(109,21,3641,46)).
'comment'('lineComment'('-- The speed regulators express bounds on the times between successive'),'src_position'(115,1,3739,70)).
'comment'('lineComment'('-- enter events.'),'src_position'(116,1,3810,16)).
'comment'('lineComment'('-- The following pair of processes express the timing contraint that'),'src_position'(125,1,4054,68)).
'comment'('lineComment'('-- the two sensor events occur within one time unit of a train entering'),'src_position'(126,1,4123,71)).
'comment'('lineComment'('-- or leaving the domain.'),'src_position'(127,1,4195,25)).
'comment'('lineComment'('-- The timing constraints of the trains and sensors are combined into the'),'src_position'(135,1,4431,73)).
'comment'('lineComment'('-- network as follows, noting that no speed limits are used outside the domain:'),'src_position'(136,1,4505,79)).
'comment'('lineComment'('-- replicated alphabet parallel now supported'),'src_position'(140,1,4684,45)).
'comment'('lineComment'('-- The last component of our system is a controller for the gate, whose duties'),'src_position'(151,1,4950,78)).
'comment'('lineComment'('-- are to ensure that the gate is always down when there is a train on the'),'src_position'(152,1,5029,74)).
'comment'('lineComment'('-- gate, and that it is up whenever prudent.'),'src_position'(153,1,5104,44)).
'comment'('lineComment'('-- Unlike the first version of this example, here we will separate the'),'src_position'(155,1,5150,70)).
'comment'('lineComment'('-- timing assumptions about how the gate behaves into a separate process.'),'src_position'(156,1,5221,73)).
'comment'('lineComment'('-- But some timing details (relating to the intervals between sensors'),'src_position'(157,1,5295,69)).
'comment'('lineComment'('-- firing and signals being sent to the gate) are coded directly into this'),'src_position'(158,1,5365,74)).
'comment'('lineComment'('-- process, to illustrate a different coding style to that used above:'),'src_position'(159,1,5440,70)).
'comment'('lineComment'('-- When the gate is up, the controller does nothing until the sensor'),'src_position'(165,5,5538,68)).
'comment'('lineComment'('-- detects an approaching train.  '),'src_position'(166,5,5611,34)).
'comment'('lineComment'('-- In this state, time is allowed to pass arbitrarily, except that the'),'src_position'(167,5,5650,70)).
'comment'('lineComment'('-- signal for the gate to go down is sent immediately on the occurrence of'),'src_position'(168,5,5725,74)).
'comment'('lineComment'('-- the sensor event.'),'src_position'(169,5,5804,20)).
'comment'('lineComment'('-- The two states ControllerGoingDown and ControllerDown both keep'),'src_position'(173,5,5979,66)).
'comment'('lineComment'('-- a record of how many trains have to pass before the gate may go'),'src_position'(174,5,6050,66)).
'comment'('lineComment'('-- up.  '),'src_position'(175,5,6121,8)).
'comment'('lineComment'('-- Each time the sensor event occurs this count is increased.'),'src_position'(176,5,6134,61)).
'comment'('lineComment'('-- The count should not get greater than the number of trains that'),'src_position'(177,5,6200,66)).
'comment'('lineComment'('-- can legally be between the sensor and the gate (which equals'),'src_position'(178,5,6271,63)).
'comment'('lineComment'('-- the number of track segments).'),'src_position'(179,5,6339,33)).
'comment'('lineComment'('-- The ControllerGoingDown state comes to an end when the'),'src_position'(180,5,6377,57)).
'comment'('lineComment'('-- gate.down event occurs'),'src_position'(181,5,6439,25)).
'comment'('lineComment'('-- When the gate is down, the occurrence of a train entering its'),'src_position'(187,5,6687,64)).
'comment'('lineComment'('-- sector causes no alarm, and each time a train leaves the gate'),'src_position'(188,5,6756,64)).
'comment'('lineComment'('-- sector the remaining count goes down, or the gate is signalled'),'src_position'(189,5,6825,65)).
'comment'('lineComment'('-- to go up, as appropriate.'),'src_position'(190,5,6895,28)).
'comment'('lineComment'('-- Time is allowed to pass arbitrarily in this state, except that'),'src_position'(191,5,6928,65)).
'comment'('lineComment'('-- the direction to the gate to go up is instantaneous when due.'),'src_position'(192,5,6998,64)).
'comment'('lineComment'('-- When the gate is going up, the inward sensor may still fire,'),'src_position'(198,5,7329,63)).
'comment'('lineComment'('-- which means that the gate must be signalled to go down again.'),'src_position'(199,5,7397,64)).
'comment'('lineComment'('-- Otherwise the gate goes up after UpTime units.'),'src_position'(200,5,7466,49)).
'comment'('lineComment'('-- Any process will be allowed to generate an error event, and since we will'),'src_position'(207,1,7758,76)).
'comment'('lineComment'('-- be establishing that these do not occur, we can make the successor process'),'src_position'(208,1,7835,77)).
'comment'('lineComment'('-- anything we please, in this case STOP.'),'src_position'(209,1,7913,41)).
'comment'('lineComment'('-- The following are the times we assume here for the gate to go up'),'src_position'(213,1,7979,67)).
'comment'('lineComment'('-- and go down.  They represent upper bounds in each case.'),'src_position'(214,1,8047,58)).
'comment'('lineComment'('-- DownTime = 5 -- make this a parameter for experimentation'),'src_position'(216,1,8107,60)).
'comment'('lineComment'('-- Since Gate has explicitly nondeterministic behaviour, we can expect'),'src_position'(244,1,8926,70)).
'comment'('lineComment'('-- to gain by applying a compression function, such as diamond, to it;'),'src_position'(245,1,8997,70)).
'comment'('lineComment'('-- we declare a number of "transparent" compression functions'),'src_position'(246,1,9068,61)).
'comment'('lineComment'('-- sbisim(X) = X  -- added by leuschel'),'src_position'(252,1,9214,38)).
'comment'('lineComment'('-- explicate(X) = X  -- added by leuschel'),'src_position'(253,1,9253,41)).
'comment'('lineComment'('-- diamond(X) = X    -- added by leuschel'),'src_position'(254,1,9295,41)).
'comment'('lineComment'('-- normalise(X) = X  -- added by leuschel'),'src_position'(255,1,9337,41)).
'comment'('lineComment'('-- Finally, we put the network together with the gate unit to give our'),'src_position'(259,1,9452,70)).
'comment'('lineComment'('-- overall system'),'src_position'(260,1,9523,17)).
'comment'('lineComment'('-- added by leuschel'),'src_position'(266,40,9698,20)).
'comment'('lineComment'('-- 142 states'),'src_position'(267,40,9758,13)).
'comment'('lineComment'('-- 3417 states'),'src_position'(268,36,9807,14)).
'comment'('lineComment'('-- 256 states'),'src_position'(269,20,9841,13)).
'comment'('lineComment'('-- 2492 states'),'src_position'(270,39,9893,14)).
'comment'('lineComment'('-- And now for specifications.  Since we have not synchronised on any'),'src_position'(271,1,9908,69)).
'comment'('lineComment'('-- error events, they would remain visible if they occurred.  Their'),'src_position'(272,1,9978,67)).
'comment'('lineComment'('-- absence can be checked with'),'src_position'(273,1,10046,30)).
'comment'('lineComment'('-- This shows that none of the explicitly caught error conditions arises,'),'src_position'(279,1,10168,73)).
'comment'('lineComment'('-- but does not show that the system has the required safety property of'),'src_position'(280,1,10242,72)).
'comment'('lineComment'('-- having no train on the GateSeg when the gate is other than down.'),'src_position'(281,1,10315,67)).
'comment'('lineComment'('-- The required specifications are slight generalisations of those'),'src_position'(283,1,10384,66)).
'comment'('lineComment'('-- discussed in specs.csp; the following notation and development is'),'src_position'(284,1,10451,68)).
'comment'('lineComment'('-- consistent with that discussed there.'),'src_position'(285,1,10520,40)).
'comment'('lineComment'('-- The above capture the sort of relationships we need between the'),'src_position'(294,1,10889,66)).
'comment'('lineComment'('-- relevant events.  If we want to stay within Failures-Divergence Refinement'),'src_position'(295,1,10956,77)).
'comment'('lineComment'('-- (as opposed to using Trace checking subtly), we need to do the following to'),'src_position'(296,1,11034,78)).
'comment'('lineComment'('-- turn them into the conditions we need:'),'src_position'(297,1,11113,41)).
'comment'('lineComment'('-- So we can form a single safety spec by conjoining these:'),'src_position'(311,1,11469,59)).
'comment'('lineComment'('-- There are a number of possible combinations which may be of interest; try'),'src_position'(315,1,11584,76)).
'comment'('lineComment'('-- assert Safety [T= System(SlowTrain,NormalGate)'),'src_position'(317,1,11662,49)).
'comment'('lineComment'('-- assert Safety [T= System(NormalTrain,NormalGate)'),'src_position'(318,1,11712,51)).
'comment'('lineComment'('-- assert NoError [T= System(FastTrain,SlowGate)'),'src_position'(319,1,11764,48)).
'comment'('lineComment'('-- assert Safety [T= System(FastTrain,NormalGate)'),'src_position'(320,1,11813,49)).
'comment'('lineComment'('-- assert NoError [T= System(FastTrain,NormalGate)'),'src_position'(321,1,11863,50)).
'comment'('lineComment'('-- assert Safety [T= System(SlowTrain,SlowGate)'),'src_position'(322,1,11914,47)).
'comment'('lineComment'('-- assert Safety [T= System(FastTrain,FastGate)'),'src_position'(323,1,11962,47)).
'comment'('lineComment'('-- An important form of liveness we have thus far ignored is that the clock'),'src_position'(327,1,12061,75)).
'comment'('lineComment'('-- is not stopped: for this it is sufficient that TimingConsistency'),'src_position'(328,1,12137,67)).
'comment'('lineComment'('-- refines TOCKS, where'),'src_position'(329,1,12205,23)).
'comment'('lineComment'('-- The following is the set of events that we cannot rely on the environment'),'src_position'(333,1,12253,76)).
'comment'('lineComment'('-- not delaying.'),'src_position'(334,1,12330,16)).
'comment'('lineComment'('-- assert TOCKS [FD= TimingConsistency(NormalTrain,NormalGate)'),'src_position'(341,1,12505,62)).
'comment'('lineComment'('-- The Safety condition completely ignored time (although, if you change some'),'src_position'(343,1,12569,77)).
'comment'('lineComment'('-- of the timing constants enough, you will find it relies upon timing for'),'src_position'(344,1,12647,74)).
'comment'('lineComment'('-- it to be satisfied).  Because of the way we are modelling time, the'),'src_position'(345,1,12722,70)).
'comment'('lineComment'('-- main liveness constraint (that the gate is up when prudent) actually'),'src_position'(346,1,12793,71)).
'comment'('lineComment'('-- becomes a safety condition (one on traces).  It is the combination of this'),'src_position'(347,1,12865,77)).
'comment'('lineComment'('-- with the TOCKS condition above (asserting that time passes) that gives'),'src_position'(348,1,12943,73)).
'comment'('lineComment'('-- it the desired meaning.'),'src_position'(349,1,13017,26)).
'comment'('lineComment'('-- We will specify that when X units of time has passed since the last'),'src_position'(351,1,13045,70)).
'comment'('lineComment'('-- train left the gate, it must be open, and remain so until another'),'src_position'(352,1,13116,68)).
'comment'('lineComment'('-- train enters the system.  This is done by the following,  which monitor'),'src_position'(353,1,13185,74)).
'comment'('lineComment'('-- the number of trains in the system and, once the last has left, no'),'src_position'(354,1,13260,69)).
'comment'('lineComment'('-- more than X units of time pass (tock events) before the gate is up.  The'),'src_position'(355,1,13330,75)).
'comment'('lineComment'('-- gate is not permitted to go down until a train is in the system.'),'src_position'(356,1,13406,67)).
'comment'('lineComment'('-- Initially the gate is up in the system, so the liveness condition'),'src_position'(369,3,13910,68)).
'comment'('lineComment'('-- takes this into account.'),'src_position'(370,3,13981,27)).
'comment'('lineComment'('-- assert GateLive(3) [T= System(NormalTrain,NormalGate)'),'src_position'(375,1,14121,56)).
'comment'('lineComment'('-- assert GateLive(2) [T= System(NormalTrain,NormalGate)'),'src_position'(376,1,14178,56)).
'comment'('lineComment'('-- assert GateLive(1) [T= System(NormalTrain,NormalGate)'),'src_position'(377,1,14235,56)).
'comment'('lineComment'('-- Note that GateLive is antitonic, so for instance'),'src_position'(379,1,14293,51)).
'comment'('lineComment'('-- assert GateLive(3) [T= GateLive(2)'),'src_position'(381,1,14346,37)).
'symbol'('tock','tock','src_span'(29,9,29,13,1145,4),'Channel').
'symbol'('GateControl','GateControl','src_span'(34,10,34,21,1256,11),'Datatype').
'symbol'('go_down','go_down','src_span'(34,24,34,31,1270,7),'Constructor of Datatype').
'symbol'('go_up','go_up','src_span'(34,34,34,39,1280,5),'Constructor of Datatype').
'symbol'('up','up','src_span'(34,42,34,44,1288,2),'Constructor of Datatype').
'symbol'('down','down','src_span'(34,47,34,51,1293,4),'Constructor of Datatype').
'symbol'('gate','gate','src_span'(39,9,39,13,1455,4),'Channel').
'symbol'('error','error','src_span'(43,9,43,14,1552,5),'Channel').
'symbol'('Segments','Segments','src_span'(49,1,49,9,1718,8),'Ident (Groundrep.)').
'symbol'('LastSeg','LastSeg','src_span'(50,1,50,8,1783,7),'Ident (Groundrep.)').
'symbol'('TRACKS','TRACKS','src_span'(51,1,51,7,1806,6),'Ident (Groundrep.)').
'symbol'('REALTRACKS','REALTRACKS','src_span'(52,1,52,11,1828,10),'Ident (Groundrep.)').
'symbol'('GateSeg','GateSeg','src_span'(57,1,57,8,1984,7),'Ident (Groundrep.)').
'symbol'('TRAINS','TRAINS','src_span'(61,10,61,16,2038,6),'Datatype').
'symbol'('Train1','Train1','src_span'(61,19,61,25,2047,6),'Constructor of Datatype').
'symbol'('Train2','Train2','src_span'(61,28,61,34,2056,6),'Constructor of Datatype').
'symbol'('enter','enter','src_span'(65,9,65,14,2114,5),'Channel').
'symbol'('leave','leave','src_span'(65,16,65,21,2121,5),'Channel').
'symbol'('sensed','sensed','src_span'(71,10,71,16,2330,6),'Datatype').
'symbol'('in','in','src_span'(71,19,71,21,2339,2),'Constructor of Datatype').
'symbol'('out','out','src_span'(71,24,71,27,2344,3),'Constructor of Datatype').
'symbol'('sensor','sensor','src_span'(73,9,73,15,2357,6),'Channel').
'symbol'('Train','Train','src_span'(79,1,79,6,2521,5),'Funktion or Process').
'symbol'('A','A','src_span'(79,7,79,8,2527,1),'Ident (Prolog Variable)').
'symbol'('j','j','src_span'(79,9,79,10,2529,1),'Ident (Prolog Variable)').
'symbol'('Trains','Trains','src_span'(83,1,83,7,2656,6),'Ident (Groundrep.)').
'symbol'('Track','Track','src_span'(88,1,88,6,2848,5),'Funktion or Process').
'symbol'('j2','j','src_span'(88,7,88,8,2854,1),'Ident (Prolog Variable)').
'symbol'('Empty','Empty','src_span'(90,5,90,10,2870,5),'Ident (Groundrep.)').
'symbol'('A2','A','src_span'(90,23,90,24,2888,1),'Ident (Prolog Variable)').
'symbol'('Full','Full','src_span'(91,5,91,9,2944,4),'Funktion or Process').
'symbol'('A3','A','src_span'(91,10,91,11,2949,1),'Ident (Prolog Variable)').
'symbol'('Tracks','Tracks','src_span'(97,1,97,7,3120,6),'Ident (Groundrep.)').
'symbol'('j3','j','src_span'(97,14,97,15,3133,1),'Ident (Prolog Variable)').
'symbol'('Network','Network','src_span'(103,1,103,8,3358,7),'Ident (Groundrep.)').
'symbol'('j4','j','src_span'(103,41,103,42,3398,1),'Ident (Prolog Variable)').
'symbol'('SlowTrain','SlowTrain','src_span'(109,1,109,10,3621,9),'Ident (Groundrep.)').
'symbol'('NormalTrain','NormalTrain','src_span'(110,1,110,12,3688,11),'Ident (Groundrep.)').
'symbol'('FastTrain','FastTrain','src_span'(111,1,111,10,3704,9),'Ident (Groundrep.)').
'symbol'('MaxTocksPerSeg','MaxTocksPerSeg','src_span'(113,1,113,15,3719,14),'Ident (Groundrep.)').
'symbol'('SpeedReg','SpeedReg','src_span'(118,1,118,9,3828,8),'Funktion or Process').
'symbol'('j5','j','src_span'(118,10,118,11,3837,1),'Ident (Prolog Variable)').
'symbol'('MinTocksPerSeg','MinTocksPerSeg','src_span'(118,12,118,26,3839,14),'Ident (Prolog Variable)').
'symbol'('Empty2','Empty','src_span'(120,5,120,10,3867,5),'Ident (Groundrep.)').
'symbol'('A4','A','src_span'(120,23,120,24,3885,1),'Ident (Prolog Variable)').
'symbol'('Full2','Full','src_span'(121,5,121,9,3919,4),'Funktion or Process').
'symbol'('n','n','src_span'(121,10,121,11,3924,1),'Ident (Prolog Variable)').
'symbol'('A5','A','src_span'(122,58,122,59,4027,1),'Ident (Prolog Variable)').
'symbol'('InSensorTiming','InSensorTiming','src_span'(129,1,129,15,4222,14),'Ident (Groundrep.)').
'symbol'('A6','A','src_span'(130,26,130,27,4287,1),'Ident (Prolog Variable)').
'symbol'('OutSensorTiming','OutSensorTiming','src_span'(132,1,132,16,4321,15),'Ident (Groundrep.)').
'symbol'('A7','A','src_span'(133,33,133,34,4395,1),'Ident (Prolog Variable)').
'symbol'('SpeedRegs','SpeedRegs','src_span'(138,1,138,10,4586,9),'Funktion or Process').
'symbol'('min','min','src_span'(138,11,138,14,4596,3),'Ident (Prolog Variable)').
'symbol'('j6','j','src_span'(139,6,139,7,4609,1),'Ident (Prolog Variable)').
'symbol'('SensorTiming','SensorTiming','src_span'(144,1,144,13,4733,12),'Ident (Groundrep.)').
'symbol'('NetworkTiming','NetworkTiming','src_span'(146,1,146,14,4791,13),'Funktion or Process').
'symbol'('min2','min','src_span'(146,15,146,18,4805,3),'Ident (Prolog Variable)').
'symbol'('TimedNetwork','TimedNetwork','src_span'(148,1,148,13,4863,12),'Funktion or Process').
'symbol'('min3','min','src_span'(148,14,148,17,4876,3),'Ident (Prolog Variable)').
'symbol'('Controller','Controller','src_span'(163,1,163,11,5514,10),'Ident (Groundrep.)').
'symbol'('ControllerUp','ControllerUp','src_span'(170,5,170,17,5829,12),'Ident (Groundrep.)').
'symbol'('ControllerGoingDown','ControllerGoingDown','src_span'(182,5,182,24,6469,19),'Funktion or Process').
'symbol'('n2','n','src_span'(182,25,182,26,6489,1),'Ident (Prolog Variable)').
'symbol'('ControllerDown','ControllerDown','src_span'(193,5,193,19,7067,14),'Funktion or Process').
'symbol'('n3','n','src_span'(193,20,193,21,7082,1),'Ident (Prolog Variable)').
'symbol'('ControllerGoingUp','ControllerGoingUp','src_span'(201,5,201,22,7520,17),'Ident (Groundrep.)').
'symbol'('ERROR','ERROR','src_span'(211,1,211,6,7956,5),'Ident (Groundrep.)').
'symbol'('VeryFastGate','VeryFastGate','src_span'(217,1,217,13,8168,12),'Ident (Groundrep.)').
'symbol'('FastGate','FastGate','src_span'(218,1,218,9,8185,8),'Ident (Groundrep.)').
'symbol'('NormalGate','NormalGate','src_span'(219,1,219,11,8198,10),'Ident (Groundrep.)').
'symbol'('SlowGate','SlowGate','src_span'(220,1,220,9,8213,8),'Ident (Groundrep.)').
'symbol'('UpTime','UpTime','src_span'(222,1,222,7,8227,6),'Ident (Groundrep.)').
'symbol'('Gate','Gate','src_span'(224,1,224,5,8239,4),'Funktion or Process').
'symbol'('DownTime','DownTime','src_span'(224,6,224,14,8244,8),'Ident (Prolog Variable)').
'symbol'('GateUp','GateUp','src_span'(226,5,226,11,8266,6),'Ident (Groundrep.)').
'symbol'('GateGoingDown','GateGoingDown','src_span'(229,5,229,18,8367,13),'Funktion or Process').
'symbol'('n4','n','src_span'(229,19,229,20,8381,1),'Ident (Prolog Variable)').
'symbol'('GateDown','GateDown','src_span'(234,5,234,13,8554,8),'Ident (Groundrep.)').
'symbol'('GateGoingUp','GateGoingUp','src_span'(237,5,237,16,8663,11),'Funktion or Process').
'symbol'('n5','n','src_span'(237,17,237,18,8675,1),'Ident (Prolog Variable)').
'symbol'('sbisim','sbisim','src_span'(248,13,248,19,9143,6),'Transparent function').
'symbol'('normalise','normalise','src_span'(249,13,249,22,9162,9),'Transparent function').
'symbol'('explicate','explicate','src_span'(250,13,250,22,9184,9),'Transparent function').
'symbol'('diamond','diamond','src_span'(251,13,251,20,9206,7),'Transparent function').
'symbol'('GateAndController','GateAndController','src_span'(257,1,257,18,9380,17),'Funktion or Process').
'symbol'('dt','dt','src_span'(257,19,257,21,9398,2),'Ident (Prolog Variable)').
'symbol'('System','System','src_span'(262,1,262,7,9542,6),'Funktion or Process').
'symbol'('invmaxspeed','invmaxspeed','src_span'(262,8,262,19,9549,11),'Ident (Prolog Variable)').
'symbol'('gatedowntime','gatedowntime','src_span'(262,20,262,32,9561,12),'Ident (Prolog Variable)').
'symbol'('MAIN','MAIN','src_span'(266,1,266,5,9659,4),'Ident (Groundrep.)').
'symbol'('MAIN1','MAIN1','src_span'(267,2,267,7,9720,5),'Ident (Groundrep.)').
'symbol'('MAIN2','MAIN2','src_span'(268,2,268,7,9773,5),'Ident (Groundrep.)').
'symbol'('MAIN21','MAIN21','src_span'(269,3,269,9,9824,6),'Ident (Groundrep.)').
'symbol'('MAIN22','MAIN22','src_span'(270,3,270,9,9857,6),'Ident (Groundrep.)').
'symbol'('NoError','NoError','src_span'(275,1,275,8,10078,7),'Ident (Groundrep.)').
'symbol'('diff','diff','src_span'(275,17,275,21,10094,4),'BuiltIn primitive').
'symbol'('SETBETWEENx','SETBETWEENx','src_span'(287,1,287,12,10562,11),'Funktion or Process').
'symbol'('EN','EN','src_span'(287,13,287,15,10574,2),'Ident (Prolog Variable)').
'symbol'('DIS','DIS','src_span'(287,16,287,19,10577,3),'Ident (Prolog Variable)').
'symbol'('C','C','src_span'(287,20,287,21,10581,1),'Ident (Prolog Variable)').
'symbol'('x','x','src_span'(287,28,287,29,10589,1),'Ident (Prolog Variable)').
'symbol'('x2','x','src_span'(288,32,288,33,10655,1),'Ident (Prolog Variable)').
'symbol'('SETOUTSIDEx','SETOUTSIDEx','src_span'(290,1,290,12,10692,11),'Funktion or Process').
'symbol'('DIS2','DIS','src_span'(290,13,290,16,10704,3),'Ident (Prolog Variable)').
'symbol'('EN2','EN','src_span'(290,17,290,19,10708,2),'Ident (Prolog Variable)').
'symbol'('C2','C','src_span'(290,20,290,21,10711,1),'Ident (Prolog Variable)').
'symbol'('c','c','src_span'(290,29,290,30,10720,1),'Ident (Prolog Variable)').
'symbol'('x3','x','src_span'(291,32,291,33,10785,1),'Ident (Prolog Variable)').
'symbol'('x4','x','src_span'(292,32,292,33,10852,1),'Ident (Prolog Variable)').
'symbol'('EnterWhenDown','EnterWhenDown','src_span'(299,1,299,14,11156,13),'Ident (Groundrep.)').
'symbol'('GateStillWhenTrain','GateStillWhenTrain','src_span'(306,1,306,19,11328,18),'Ident (Groundrep.)').
'symbol'('Safety','Safety','src_span'(313,1,313,7,11530,6),'Ident (Groundrep.)').
'symbol'('TOCKS','TOCKS','src_span'(331,1,331,6,12230,5),'Ident (Groundrep.)').
'symbol'('Delayable','Delayable','src_span'(336,1,336,10,12348,9),'Ident (Groundrep.)').
'symbol'('NonTock','NonTock','src_span'(337,1,337,8,12372,7),'Ident (Groundrep.)').
'symbol'('TimingConsistency','TimingConsistency','src_span'(338,1,338,18,12402,17),'Funktion or Process').
'symbol'('ts','ts','src_span'(338,19,338,21,12420,2),'Ident (Prolog Variable)').
'symbol'('gs','gs','src_span'(338,22,338,24,12423,2),'Ident (Prolog Variable)').
'symbol'('Liveness','Liveness','src_span'(358,1,358,9,13475,8),'Funktion or Process').
'symbol'('X','X','src_span'(358,10,358,11,13484,1),'Ident (Prolog Variable)').
'symbol'('Idle','Idle','src_span'(360,5,360,9,13499,4),'Ident (Groundrep.)').
'symbol'('Busy','Busy','src_span'(362,5,362,9,13555,4),'Funktion or Process').
'symbol'('n6','n','src_span'(362,10,362,11,13560,1),'Ident (Prolog Variable)').
'symbol'('UpBefore','UpBefore','src_span'(366,5,366,13,13758,8),'Funktion or Process').
'symbol'('m','m','src_span'(366,14,366,15,13767,1),'Ident (Prolog Variable)').
'symbol'('x5','x','src_span'(367,24,367,25,13826,1),'Ident (Prolog Variable)').
'symbol'('GateLive','GateLive','src_span'(373,1,373,9,14041,8),'Funktion or Process').
'symbol'('X2','X','src_span'(373,10,373,11,14050,1),'Ident (Prolog Variable)').