<?php

class TM_Testimonials_Block_List_Title extends Mage_Core_Block_Template
{

  public function isShowSubmitButton()
  {
    return Mage::getSingleton('customer/session')->isLoggedIn();
  }

}

