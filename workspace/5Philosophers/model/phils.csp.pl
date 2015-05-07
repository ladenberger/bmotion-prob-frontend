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
'bindval'('N','int'(5),'src_span'(8,1,8,6,170,5)).
'bindval'('PHILNAMES','setExp'('rangeClosed'('int'(0),'-'('val_of'('N','src_span'(10,16,10,17,192,1)),'int'(1)))),'src_span'(10,1,10,20,177,19)).
'bindval'('FORKNAMES','setExp'('rangeClosed'('int'(0),'-'('val_of'('N','src_span'(11,17,11,18,213,1)),'int'(1)))),'src_span'(11,1,11,21,197,20)).
'channel'('thinks','type'('dotTupleType'(['val_of'('PHILNAMES','src_span'(13,36,13,45,254,9))]))).
'channel'('sits','type'('dotTupleType'(['val_of'('PHILNAMES','src_span'(13,36,13,45,254,9))]))).
'channel'('eats','type'('dotTupleType'(['val_of'('PHILNAMES','src_span'(13,36,13,45,254,9))]))).
'channel'('getsup','type'('dotTupleType'(['val_of'('PHILNAMES','src_span'(13,36,13,45,254,9))]))).
'channel'('picks','type'('dotTupleType'(['val_of'('PHILNAMES','src_span'(14,25,14,34,288,9)),'val_of'('FORKNAMES','src_span'(14,35,14,44,298,9))]))).
'channel'('putsdown','type'('dotTupleType'(['val_of'('PHILNAMES','src_span'(14,25,14,34,288,9)),'val_of'('FORKNAMES','src_span'(14,35,14,44,298,9))]))).
'agent'('PHIL'(_i),'prefix'('src_span'(19,11,19,19,437,8),[],'dotTuple'(['thinks',_i]),'prefix'('src_span'(19,23,19,27,449,4),['out'(_i)],'sits','prefix'('src_span'(19,33,19,38,459,5),['out'(_i),'out'(_i)],'picks','prefix'('src_span'(19,46,19,51,472,5),['out'(_i),'out'('%'('+'(_i,'int'(1)),'val_of'('N','src_span'(19,61,19,62,487,1))))],'picks','prefix'('src_span'(20,11,20,15,503,4),['out'(_i)],'eats','prefix'('src_span'(20,21,20,29,513,8),['out'(_i),'out'('%'('+'(_i,'int'(1)),'val_of'('N','src_span'(20,39,20,40,531,1))))],'putsdown','prefix'('src_span'(20,45,20,53,537,8),['out'(_i),'out'(_i)],'putsdown','prefix'('src_span'(20,61,20,67,553,6),['out'(_i)],'getsup','agent_call'('src_span'(20,73,20,77,565,4),'PHIL',[_i]),'src_span'(20,70,20,72,561,13)),'src_span'(20,58,20,60,549,25)),'src_span'(20,42,20,44,533,49)),'src_span'(20,18,20,20,509,65)),'src_span'(19,64,20,10,489,93)),'src_span'(19,43,19,45,468,106)),'src_span'(19,30,19,32,455,119)),'src_span'(19,20,19,22,445,135)),'src_span'(19,11,20,80,437,135)).
'agent'('PHILs'(_i2),'prefix'('src_span'(25,13,25,18,721,5),['out'(_i2),'out'(_i2)],'picks','prefix'('src_span'(25,26,25,31,734,5),['out'(_i2),'out'('%'('+'(_i2,'int'(1)),'val_of'('N','src_span'(25,41,25,42,749,1))))],'picks','prefix'('src_span'(26,12,26,20,766,8),['out'(_i2),'out'('%'('+'(_i2,'int'(1)),'val_of'('N','src_span'(26,30,26,31,784,1))))],'putsdown','prefix'('src_span'(26,36,26,44,790,8),['out'(_i2),'out'(_i2)],'putsdown','agent_call'('src_span'(26,52,26,57,806,5),'PHILs',[_i2]),'src_span'(26,49,26,51,802,14)),'src_span'(26,33,26,35,786,38)),'src_span'(25,44,26,11,751,73)),'src_span'(25,23,25,25,730,86)),'src_span'(25,13,26,60,721,93)).
'agent'('AlphaP'(_i3),'setExp'('rangeEnum'(['dotTuple'(['thinks',_i3]),'dotTuple'(['sits',_i3]),'dotTuple'(['picks',_i3,_i3]),'dotTuple'(['picks',_i3,'%'('+'(_i3,'int'(1)),'val_of'('N','src_span'(32,55,32,56,892,1)))]),'dotTuple'(['eats',_i3]),'dotTuple'(['putsdown',_i3,_i3]),'dotTuple'(['putsdown',_i3,'%'('+'(_i3,'int'(1)),'val_of'('N','src_span'(33,31,33,32,945,1)))]),'dotTuple'(['getsup',_i3])])),'src_span'(32,13,33,42,850,106)).
'agent'('FORK'(_i4),'[]'('prefix'('src_span'(37,11,37,16,1027,5),['out'(_i4),'out'(_i4)],'picks','prefix'('src_span'(37,24,37,32,1040,8),['out'(_i4),'out'(_i4)],'putsdown','agent_call'('src_span'(37,40,37,44,1056,4),'FORK',[_i4]),'src_span'(37,37,37,39,1052,13)),'src_span'(37,21,37,23,1036,29)),'prefix'('src_span'(38,14,38,19,1077,5),['out'('%'('-'(_i4,'int'(1)),'val_of'('N','src_span'(38,27,38,28,1090,1)))),'out'(_i4)],'picks','prefix'('src_span'(38,35,38,43,1098,8),['out'('%'('-'(_i4,'int'(1)),'val_of'('N','src_span'(38,51,38,52,1114,1)))),'out'(_i4)],'putsdown','agent_call'('src_span'(38,59,38,63,1122,4),'FORK',[_i4]),'src_span'(38,56,38,58,1118,13)),'src_span'(38,32,38,34,1094,37)),'src_span_operator'('no_loc_info_available','src_span'(38,10,38,12,1073,2))),'no_loc_info_available').
'agent'('AlphaF'(_i5),'setExp'('rangeEnum'(['dotTuple'(['picks',_i5,_i5]),'dotTuple'(['picks','%'('-'(_i5,'int'(1)),'val_of'('N','src_span'(40,37,40,38,1167,1))),_i5]),'dotTuple'(['putsdown',_i5,_i5]),'dotTuple'(['putsdown','%'('-'(_i5,'int'(1)),'val_of'('N','src_span'(40,71,40,72,1201,1))),_i5])])),'src_span'(40,13,40,75,1143,62)).
'bindval'('SYSTEM','procRepAParallel'(['comprehensionGenerator'(_i6,'val_of'('PHILNAMES','src_span'(48,15,48,24,1488,9)))],'pair'('agent_call'('src_span'(48,26,48,31,1499,5),'union',['agent_call'('src_span'(48,32,48,38,1505,6),'AlphaP',[_i6]),'agent_call'('src_span'(48,42,48,48,1515,6),'AlphaF',[_i6])]),'aParallel'('agent_call'('src_span'(49,33,49,39,1560,6),'AlphaP',[_i6]),'agent_call'('src_span'(49,25,49,29,1552,4),'PHIL',[_i6]),'agent_call'('src_span'(49,45,49,51,1572,6),'AlphaF',[_i6]),'agent_call'('src_span'(49,56,49,60,1583,4),'FORK',[_i6]),'src_span'(49,32,49,55,1559,23))),'src_span'(48,13,48,25,1486,12)),'src_span'(48,1,49,64,1474,117)).
'bindval'('SYSTEMs','procRepAParallel'(['comprehensionGenerator'(_i7,'val_of'('PHILNAMES','src_span'(53,16,53,25,1629,9)))],'pair'('agent_call'('src_span'(53,27,53,32,1640,5),'union',['agent_call'('src_span'(53,33,53,39,1646,6),'AlphaP',[_i7]),'agent_call'('src_span'(53,43,53,49,1656,6),'AlphaF',[_i7])]),'aParallel'('agent_call'('src_span'(54,34,54,40,1702,6),'AlphaP',[_i7]),'agent_call'('src_span'(54,25,54,30,1693,5),'PHILs',[_i7]),'agent_call'('src_span'(54,46,54,52,1714,6),'AlphaF',[_i7]),'agent_call'('src_span'(54,57,54,61,1725,4),'FORK',[_i7]),'src_span'(54,33,54,56,1701,23))),'src_span'(53,14,53,26,1627,12)),'src_span'(53,1,54,65,1614,119)).
'bindval'('PHILS','repInterleave'(['comprehensionGenerator'(_i8,'val_of'('PHILNAMES','src_span'(62,15,62,24,1955,9)))],'agent_call'('src_span'(62,26,62,30,1966,4),'PHIL',[_i8]),'src_span'(62,13,62,25,1953,12)),'src_span'(62,1,62,33,1941,32)).
'bindval'('FORKS','repInterleave'(['comprehensionGenerator'(_i9,'val_of'('FORKNAMES','src_span'(63,15,63,24,1988,9)))],'agent_call'('src_span'(63,26,63,30,1999,4),'FORK',[_i9]),'src_span'(63,13,63,25,1986,12)),'src_span'(63,1,63,33,1974,32)).
'bindval'('SYSTEM\x27\','sharing'('closure'(['picks','putsdown']),'val_of'('PHILS','src_span'(65,11,65,16,2018,5)),'val_of'('FORKS','src_span'(65,39,65,44,2046,5)),'src_span'(65,16,65,39,2023,23)),'src_span'(65,1,65,44,2008,43)).
'bindval'('MAIN','val_of'('SYSTEM\x27\','src_span'(67,8,67,15,2060,7)),'src_span'(67,1,67,15,2053,14)).
'comment'('lineComment'('-- The five dining philosophers for FDR'),'src_position'(1,1,0,39)).
'comment'('lineComment'('-- Bill Roscoe'),'src_position'(3,1,41,14)).
'comment'('lineComment'('-- The most standard example of them all.  We can determine how many'),'src_position'(5,1,57,68)).
'comment'('lineComment'('-- (with the conventional number being 5):'),'src_position'(6,1,126,42)).
'comment'('lineComment'('-- A philosopher thinks, sits down, picks up two forks, eats, puts down forks'),'src_position'(16,1,309,77)).
'comment'('lineComment'('-- and gets up, in an unending cycle.\x9\'),'src_position'(17,1,387,38)).
'comment'('lineComment'('-- Of course the only events relevant to deadlock are the picks and putsdown'),'src_position'(22,1,574,76)).
'comment'('lineComment'('-- ones.  Try the alternative "stripped down" definition'),'src_position'(23,1,651,56)).
'comment'('lineComment'('-- Its alphabet is'),'src_position'(30,1,818,18)).
'comment'('lineComment'('-- A fork can only be picked up by one neighbour at once!'),'src_position'(35,1,958,57)).
'comment'('lineComment'('-- We can build the system up in several ways, but certainly'),'src_position'(42,1,1207,60)).
'comment'('lineComment'('-- have to use some form of parallel that allows us to'),'src_position'(43,1,1268,54)).
'comment'('lineComment'('-- build a network parameterized by N.  The following uses'),'src_position'(44,1,1323,58)).
'comment'('lineComment'('-- a composition of N philosopher/fork pairs, each individually'),'src_position'(45,1,1382,63)).
'comment'('lineComment'('-- a parallel composition.'),'src_position'(46,1,1446,26)).
'comment'('lineComment'('-- or stripped down'),'src_position'(51,1,1593,19)).
'comment'('lineComment'('-- As an alternative (see Section 2.3) we can create separate'),'src_position'(57,1,1736,61)).
'comment'('lineComment'('-- collections of the philosophers and forks, each composed'),'src_position'(58,1,1798,59)).
'comment'('lineComment'('-- using interleaving ||| since there is no communication inside'),'src_position'(59,1,1858,64)).
'comment'('lineComment'('-- these groups.'),'src_position'(60,1,1923,16)).
'comment'('blockComment'('{-\xa\-- The potential for deadlock is illustrated by \xa\\xa\assert SYSTEM :[deadlock free [F]]\xa\\xa\-- or equivalently in the stripped down\xa\assert SYSTEMs :[deadlock free [F]]\xa\\xa\-- which will find the same deadlock a lot faster.\xa\\xa\-- There are several well-known solutions to the problem.  One involves a\xa\-- butler who must co-operate on the sitting down and getting up events,\xa\-- and always ensures that no more than four of the five\xa\-- philosophers are seated.\xa\\xa\BUTLER(j) = j>0 & getsup?i -> BUTLER(j-1)\xa\            []j<N-1 & sits?i -> BUTLER(j+1)\xa\\xa\BSYSTEM = SYSTEM [|{|sits, getsup|}|] BUTLER(0)\xa\\xa\assert BSYSTEM :[deadlock free [F]]\xa\\xa\-- We would have to reduce the amount of stripping down for this,\xa\-- since it makes the sits and getsup events useful...try this.\xa\\xa\-- A second solution involves replacing one of the above right-handed (say)\xa\-- philosophers by a left-handed one:\xa\\xa\LPHIL(i)= thinks.i -> sits.i -> picks.i.((i+1)%N) -> picks.i.i -> \xa\          eats.i -> putsdown.i.((i+1)%N) -> putsdown.i.i -> getsup.i -> LPHIL(i)\xa\\xa\ASPHILS = ||| i:PHILNAMES @ if i==0 then LPHIL(i) else PHIL(i)\xa\\xa\ASSYSTEM = ASPHILS[|{|picks, putsdown|}|]FORKS\xa\\xa\-- This asymmetric system is deadlock free, as can be proved using Check.  \xa\\xa\assert ASSYSTEM :[deadlock free [F]]\xa\\xa\-- If you want to run a lot of dining philosophers, the best results will\xa\-- probably be obtained by removing the events irrelevant to ASSYSTEM\xa\-- (leaving only picks and putsdown) in:\xa\LPHILs(i)=  picks.i.((i+1)%N) -> picks.i.i -> \xa\           putsdown.i.((i+1)%N) -> putsdown.i.i -> LPHILs(i)\xa\\xa\ASPHILSs = ||| i:PHILNAMES @ if i==0 then LPHILs(i) else PHILs(i)\xa\\xa\ASSYSTEMs = ASPHILSs[|{|picks, putsdown|}|]FORKS\xa\\xa\assert ASSYSTEMs :[deadlock free [F]]\xa\\xa\-- Setting N=10 will show the spectacular difference in running the\xa\-- stripped down version.  Try to undertand why there is such an\xa\-- enormous difference.\xa\\xa\-- Compare the stripped down versions with the idea of "Leaf Compression"\xa\-- discussed in Chapter 8.\xa\-}'),'src_position'(69,1,2069,1957)).
'symbol'('N','N','src_span'(8,1,8,2,170,1),'Ident (Groundrep.)').
'symbol'('PHILNAMES','PHILNAMES','src_span'(10,1,10,10,177,9),'Ident (Groundrep.)').
'symbol'('FORKNAMES','FORKNAMES','src_span'(11,1,11,10,197,9),'Ident (Groundrep.)').
'symbol'('thinks','thinks','src_span'(13,9,13,15,227,6),'Channel').
'symbol'('sits','sits','src_span'(13,17,13,21,235,4),'Channel').
'symbol'('eats','eats','src_span'(13,23,13,27,241,4),'Channel').
'symbol'('getsup','getsup','src_span'(13,29,13,35,247,6),'Channel').
'symbol'('picks','picks','src_span'(14,9,14,14,272,5),'Channel').
'symbol'('putsdown','putsdown','src_span'(14,16,14,24,279,8),'Channel').
'symbol'('PHIL','PHIL','src_span'(19,1,19,5,427,4),'Funktion or Process').
'symbol'('i','i','src_span'(19,6,19,7,432,1),'Ident (Prolog Variable)').
'symbol'('PHILs','PHILs','src_span'(25,1,25,6,709,5),'Funktion or Process').
'symbol'('i2','i','src_span'(25,7,25,8,715,1),'Ident (Prolog Variable)').
'symbol'('AlphaP','AlphaP','src_span'(32,1,32,7,838,6),'Funktion or Process').
'symbol'('i3','i','src_span'(32,8,32,9,845,1),'Ident (Prolog Variable)').
'symbol'('FORK','FORK','src_span'(37,1,37,5,1017,4),'Funktion or Process').
'symbol'('i4','i','src_span'(37,6,37,7,1022,1),'Ident (Prolog Variable)').
'symbol'('AlphaF','AlphaF','src_span'(40,1,40,7,1131,6),'Funktion or Process').
'symbol'('i5','i','src_span'(40,8,40,9,1138,1),'Ident (Prolog Variable)').
'symbol'('SYSTEM','SYSTEM','src_span'(48,1,48,7,1474,6),'Ident (Groundrep.)').
'symbol'('i6','i','src_span'(48,13,48,14,1486,1),'Ident (Prolog Variable)').
'symbol'('union','union','src_span'(48,26,48,31,1499,5),'BuiltIn primitive').
'symbol'('SYSTEMs','SYSTEMs','src_span'(53,1,53,8,1614,7),'Ident (Groundrep.)').
'symbol'('i7','i','src_span'(53,14,53,15,1627,1),'Ident (Prolog Variable)').
'symbol'('union','union','src_span'(53,27,53,32,1640,5),'BuiltIn primitive').
'symbol'('PHILS','PHILS','src_span'(62,1,62,6,1941,5),'Ident (Groundrep.)').
'symbol'('i8','i','src_span'(62,13,62,14,1953,1),'Ident (Prolog Variable)').
'symbol'('FORKS','FORKS','src_span'(63,1,63,6,1974,5),'Ident (Groundrep.)').
'symbol'('i9','i','src_span'(63,13,63,14,1986,1),'Ident (Prolog Variable)').
'symbol'('SYSTEM\x27\','SYSTEM\x27\','src_span'(65,1,65,8,2008,7),'Ident (Groundrep.)').
'symbol'('MAIN','MAIN','src_span'(67,1,67,5,2053,4),'Ident (Groundrep.)').