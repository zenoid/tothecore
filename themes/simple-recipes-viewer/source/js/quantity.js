document.addEventListener( 'DOMContentLoaded', function() {

  'use strict';

  /*

      Recipe calculation

  */

  var recipeBaseValue,
    baseMin = 100,
    baseMax = 5000,
    baseStep = 50,
    ingrPrec = 2,
    addQtyBtns,
    removeQtyBtns,
    qtyLabels,
    qtyPlurals,
    qtyValue;

  function remove()
  {
    recipeBaseValue = Math.max( baseMin, recipeBaseValue - baseStep );
    calcQty();
  }

  function add()
  {
    recipeBaseValue = Math.min( baseMax, recipeBaseValue + baseStep );
    calcQty();
  }

  function round( qty, prec, ceil = false )
  {
    var f,
      q = ceil? Math.ceil( qty ) : Math.round( qty );
    if ( String( q ).length > prec ) {
      f = Math.pow( 10, String( q ).length - prec );
      q = ceil? Math.ceil( q / f ) * f : Math.round( q / f ) * f;
    }
    return q;
  }

  function calcQty()
  {
    var i, qty, mult, qtyId, volType, contSize, plurId, plurOptions, ceil,
      recipeWeight = recipeBaseValue * recipeBaseRatio;
    qtyValue.textContent = recipeBaseValue;
    setQtyButtons();
    for ( i in ingredients ) {
      ingredients[ i ].qty = recipeWeight * ingredients[ i ].ratio / 100;
    }
    for ( i = 0; i < qtyLabels.length; i++ ) {
      qtyId = qtyLabels[ i ].dataset.qty.split( '.' )[ 0 ];
      ceil = false;
      if ( qtyLabels[ i ].dataset.mult ) {
        mult = +qtyLabels[ i ].dataset.mult;
      } else {
        mult = 1;
      }
      if ( ingredients[ qtyId ] ) {
        qty = ingredients[ qtyId ].qty;
      }
      if ( qtyId === 'volume' ) {
        ceil = true;
        volType = qtyLabels[ i ].dataset.qty.split( '.' )[ 1 ];
        if ( volType === 'base' ) {
          qty = recipeBaseValue;
        } else {
          if ( ingredients[ volType ].units === 'ml' ) {
            qty = ingredients[ volType ].qty;
          } else {
            qty = ingredients[ volType ].qty / ingredients[ volType ].spec;
          }
        }
      }
      if ( qtyId === 'containers' ) {
        ceil = true;
        contSize = +qtyLabels[ i ].dataset.qty.split( '.' )[ 1 ];
        qty = recipeBaseValue / contSize;
      }
      qty = round( qty * mult, qtyLabels[ i ].dataset.prec || ingrPrec, ceil );
      qtyLabels[ i ].textContent = qty;
      if ( qtyId !== 'volume' && qtyId !== 'containers' ) {
        if ( ingredients[ qtyId ].spec && qtyId !== 'lye' && ingredients[ qtyId ].units === 'gr' ) {
          let qtyVol = round( qty / ingredients[ qtyId ].spec, qtyLabels[ i ].dataset.prec || ingrPrec, ceil );
          qtyLabels[ i ].parentNode.dataset.tooltip = "= " + qtyVol + " ml";
        }
      }
    }
    for ( i = 0; i < qtyPlurals.length; i++ ) {
      plurId = qtyPlurals[ i ].dataset.plural.split( '.' )[ 0 ],
      plurOptions = qtyPlurals[ i ].dataset.plural.split( '.' )[ 1 ].split( '-' );
      qty = round( ingredients[ plurId ].qty );
      qtyPlurals[ i ].textContent = plurOptions[ qty > 1? 1 : 0 ]
    }
  }

  function setQtyButtons() {
    Array.from( addQtyBtns ).forEach( btn => {
      btn.disabled = ( recipeBaseValue === baseMax );
    });
    Array.from( removeQtyBtns ).forEach( btn => {
      btn.disabled = ( recipeBaseValue === baseMin );
    });
  }

  function setup()
  {
    recipeBaseValue = recipeBase.qty;

    if ( typeof recipeRange !== 'undefined' ) {
      baseMin  = recipeRange[ 0 ];
      baseMax  = recipeRange[ 1 ];
      baseStep = recipeRange[ 2 ];
    }
    if ( typeof recipePrecision !== 'undefined' ) {
      ingrPrec = recipePrecision;
    }

    qtyLabels = document.querySelectorAll( '[data-qty]' );
    qtyPlurals = document.querySelectorAll( '[data-plural]' );
    qtyValue = document.getElementById( 'qtyValue' );
    addQtyBtns = document.querySelectorAll( '.btn-icon-plus' );
    removeQtyBtns = document.querySelectorAll( '.btn-icon-minus' );
    Array.from( addQtyBtns ).forEach( btn => {
      btn.addEventListener( 'click', add );
    });
    Array.from( removeQtyBtns ).forEach( btn => {
      btn.addEventListener( 'click', remove );
    });

    calcQty();
  }

  /* ----------------------------- */

  window.quantity = {
    setup: setup,
    add: add,
    remove: remove
  };

});