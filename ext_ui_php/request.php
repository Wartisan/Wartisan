<?php 
//if (isset($_POST['submitb'])){
//    echo $_POST['startdate'];
//}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Wartisan update interface</title>
<link rel="stylesheet" type="text/css" href="css/style-br.css"/>
<link rel="stylesheet" type="text/css" href="css/tcal.css" />
<script src="js/tcal.js"></script> 
<script src="js/jquery-1.10.2.js"></script>
<script src="js/jquery-customize-br.js"></script>
</head>

<body>
<div id="lpanel">

<!--<div id="lfunc">
<input type="button" id="newb" class="lfunc" name="newb" value="New!"/>
<input type="button" id="updateb" class="lfunc" name="updateb" value="Update"/>
<input type="button" id="deleteb" class="lfunc" name="deleteb" value="Delete"/>
<input type="button" id="timelb" class="lfunc" name="timelb" value="Timeline"/>
</div>-->
<div id="lsubject111"><h3><!--subject: wartisan main page--></h3></div>
<form >
<table id='w_table'>
<tr>
<td><div align="right">Request:</div></td>
<td><input type="text" id="w_title" name="title" value=""></td>
</tr>
<tr>
<td><div align="right">Description:</div></td>
<td><textarea id="w_description" name="description"></textarea></td>
</tr>
</table>
<!--   <input type="text" id="newb" class="lfunc" name="newb" value="New!"/> -->
<div id="lmain">
	<ol id="lupditem"></ol>
</div>
<div id="ldate">
<div style="float: left">
<table>
<tr>
<td><div align="right">Start Date:</div></td>
<td><input type="text" id="startdate" name="startdate" class="tcal" value="" readonly="readonly"></td>
</tr>
<tr>
<td><div align="right">End Date:</div></td>
<td><input type="text" id="enddate" name="enddate" class="tcal" value=""/></td>
</tr>
</table>
</div>
<div style="float: right; margin-top: 15px; margin-right: 30px;">
</div>
</div>
<div id="lcommit">
<input type="button" id="save" class="lcommit" name="saveb" value="Save"/>
<!-- <input type="button" id="refresh" class="lcommit" name="refresh" value="Refresh"/> -->

</div>
</form>
</div>
</body>
</html>