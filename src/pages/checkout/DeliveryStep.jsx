import { useState } from 'react'
import RadioCard from '../../components/ui/RadioCard'
import Button from '../../components/ui/Button'
import { useShipping } from '../../store/hooks'
import { formatCurrency } from '../../utils/formatCurrency'

export default function DeliveryStep({ data, onChange, onNext, onBack }) {
  const { couriers } = useShipping()

  const initialCourier = couriers.find((c) => c.name === data.shipping?.courier)
  const [courierId, setCourierId] = useState(initialCourier?.id ?? null)
  const selectedCourier = couriers.find((c) => c.id === courierId) || null

  function handleSelectCourier(courier) {
    setCourierId(courier.id)
    // Reset the chosen service when switching couriers.
    if (data.shipping && data.shipping.courier !== courier.name) {
      onChange({ shipping: null })
    }
  }

  function handleSelectService(courier, service) {
    onChange({
      shipping: {
        courier: courier.name,
        service: service.name,
        cost: service.cost,
        etaLabel: service.etaLabel,
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Pilih kurir</h2>
        <p className="mt-1 text-sm text-neutral-600">Tentukan kurir dan layanan pengiriman.</p>
        <div className="mt-3 flex flex-col gap-3">
          {couriers.map((courier) => (
            <RadioCard
              key={courier.id}
              selected={courierId === courier.id}
              onSelect={() => handleSelectCourier(courier)}
              title={courier.name}
              subtitle={`${courier.services.length} layanan tersedia`}
            />
          ))}
        </div>
      </div>

      {selectedCourier && (
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Pilih layanan</h2>
          <div className="mt-3 flex flex-col gap-3">
            {selectedCourier.services.map((service) => (
              <RadioCard
                key={service.id}
                selected={
                  data.shipping?.courier === selectedCourier.name &&
                  data.shipping?.service === service.name
                }
                onSelect={() => handleSelectService(selectedCourier, service)}
                title={service.name}
                subtitle={service.etaLabel}
                right={
                  <span className="text-sm font-medium text-neutral-900">
                    {formatCurrency(service.cost)}
                  </span>
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
          Kembali
        </Button>
        <Button
          variant="primary"
          disabled={!data.shipping}
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          Lanjut ke Ringkasan
        </Button>
      </div>
    </div>
  )
}
