const mongoose = require('mongoose')

const CAPTURES = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  amount: {
    currency_code: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  final_capture: {
    type: Boolean,
    required: true
  },
  seller_protection: {
    status: {
      type: String,
      required: true
    },
    dispute_categories: Array({
      type: String,
      required: true
    })
  },
  seller_receivable_breakdown: {
    gross_amount: {
      currency_code: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    },
    paypal_fee: {
      currency_code: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    },
    net_amount: {
      currency_code: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  },
  links: Array({
    href: {
      type: String,
      required: true
    },
    rel: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: true
    }
  }),
  create_time: {
    type: String,
    required: true
  },
  update_time: {
    type: String,
    required: true
  }
})

const PAYPAL = new mongoose.Schema({
  paypal: {
    email_address: {
      type: String,
      required: true
    },
    account_id: {
      type: String,
      required: true
    },
    account_status: {
      type: String,
      required: true
    },
    name: {
      given_name: {
        type: String,
        required: true
      },
      surname: {
        type: String,
        required: true
      }
    },
    address: {
      country_code: {
        type: String,
        required: true
      }
    }
  }
})

const PURCHASE_UNITS = new mongoose.Schema({
  reference_id: {
    type: String,
    required: true
  },
  shipping: {
    name: {
      full_name: {
        type: String,
        required: true
      }
    },
    address: {
      address_line_1: {
        type: String,
        required: true
      },
      admin_area_2: {
        type: String,
        required: true
      },
      admin_area_1: {
        type: String,
        required: true
      },
      postal_code: {
        type: String,
        required: true
      },
      country_code: {
        type: String,
        required: true
      }
    }
  },
  payments: {
    captures: {
      type: Array(CAPTURES),
      required: true
    }
  }
})

const payerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  payment_source: {
    type: PAYPAL
  },
  purchase_units: {
    type: Array(PURCHASE_UNITS),
    required: true
  },
})

const Payer = mongoose.model('Payer', payerSchema)
module.exports = Payer